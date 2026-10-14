import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load root .env first, then local fallback
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import { Queue } from "bullmq";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { traceable } from "langsmith/traceable";
import { generateSparseVector } from "./lib/bm25.js";
import { rerankCandidates } from "./lib/reranker.js";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const PORT = process.env.PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const queue = new Queue("file-upload-queue", {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);
      cb(null, `${file.originalname}`);
    });
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (req, res) => {
  return res.json({ status: "DocBridge 2.0 API is healthy" });
});

// 1. Traceable Qdrant Hybrid Search Retriever
const searchQdrantHybrid = traceable(
  async (qdrantClient, denseVector, sparseVector, filter) => {
    return await qdrantClient.query("pdf-docs", {
      prefetch: [
        {
          query: denseVector,
          using: "dense",
          limit: 15,
          filter,
        },
        {
          query: {
            indices: sparseVector.indices,
            values: sparseVector.values,
          },
          using: "sparse",
          limit: 15,
          filter,
        },
      ],
      query: {
        fusion: "rrf", // Reciprocal Rank Fusion
      },
      limit: 12,
      with_payload: true,
    });
  },
  { name: "Qdrant Hybrid Search (RRF)", run_type: "retriever" }
);

// 2. Traceable Answer Generation with Token & Cost Reporting
const generateLlmAnswer = traceable(
  async (userQuery, systemPrompt) => {
    let chatModel;
    try {
      chatModel = new ChatGoogleGenerativeAI({
        model: "gemini-3.8-flash",
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.2,
      });
      const response = await chatModel.invoke([
        ["system", systemPrompt],
        ["human", userQuery],
      ]);
      return typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);
    } catch (primaryErr) {
      console.warn("Primary model error, attempting fallback:", primaryErr.message);
      chatModel = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0.2,
      });
      const fallbackResponse = await chatModel.invoke([
        ["system", systemPrompt],
        ["human", userQuery],
      ]);
      return typeof fallbackResponse.content === "string"
        ? fallbackResponse.content
        : JSON.stringify(fallbackResponse.content);
    }
  },
  { name: "Gemini Answer Generation", run_type: "llm" }
);

// 3. Parent End-to-End RAG Traceable Pipeline
const executeChatRAG = traceable(
  async (userQuery, docId, qdrantClient, embeddings, client) => {
    // Check Collection Status
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some((c) => c.name === "pdf-docs");

    if (!exists) {
      return { answer: "No documents uploaded yet.", source: [] };
    }

    // 1. Generate both Dense and Sparse representations for the query
    const [denseVector, sparseVector] = await Promise.all([
      embeddings.embedQuery(userQuery),
      Promise.resolve(generateSparseVector(userQuery)),
    ]);

    // 2. Optional: Filter by specific document if docId is passed
    const filter = docId ? {
      must: [{
        key: "metadata.docId",
        match: { value: docId }
      }]
    } : undefined;

    // 3. Hybrid Search with RRF
    const searchResults = await searchQdrantHybrid(qdrantClient, denseVector, sparseVector, filter);

    // 4. Format the retrieved chunks for prompt and frontend
    const retreivedDocs = searchResults.points.map((p) => ({
      pageContent: p.payload.pageContent || '',
      metadata: p.payload.metadata || {},
      score: p.score
    }));

    // 5. Re-rank candidates down to top golden snippets
    const { goldenDocs, hasSufficientContext } = await rerankCandidates(
      client,
      userQuery,
      retreivedDocs,
      3
    );

    if (goldenDocs.length === 0 || !hasSufficientContext) {
      return {
        answer: "I couldn't find any relevant information in the document to answer your question.",
        source: []
      };
    }

    // 6. Build Grounded Prompt with Page Citations
    const contextText = goldenDocs
      .map(
        (doc, i) =>
          `Source ${i + 1} | Page ${doc.metadata?.pageNumber || "N/A"}\n${doc.pageContent}`
      )
      .join("\n");

    const SYSTEM_PROMPT = `You are Docbridge, a high-precision document intelligence assistant.
Answer the user's question clearly and concisely using ONLY the provided PDF context below.
Do not make up facts.
When referencing specific facts from the sources, cite them inline using the format: [Source X | Page Y] (e.g. [Source 1 | Page 4]).
CRITICAL CITATION RULES:
1. Embed citations inline immediately after the relevant fact, e.g. [Source 1 | Page 4].
2. Do NOT append a bibliography, reference list, or trailing "Cited: Page X" block at the bottom of your response. Citations are rendered automatically by the UI.

Context:
${contextText}
If the answer is not found in the PDF, say: "I couldn't find the answer in the document."`;

    // 7. Generate Answer
    const answerText = await generateLlmAnswer(userQuery, SYSTEM_PROMPT);

    return {
      answer: answerText,
      source: goldenDocs,
    };
  },
  { name: "DocBridge RAG Pipeline", run_type: "chain" }
);

app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;
  const docId = req.query.docId;

  if (!userQuery) {
    return res.status(400).json({ error: "No query provided" });
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const qdrantClient = new QdrantClient({
    url: QDRANT_URL,
  });

  try {
    const result = await executeChatRAG(userQuery, docId, qdrantClient, embeddings, client);
    return res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      answer: "An error occurred while processing your request.",
      source: []
    });
  }
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  const docId = crypto.randomUUID();
  // creating job to be done by worker
  await queue.add(
    "file-ready",
    JSON.stringify({
      docId,
      filename: req.file.originalname,
      source: req.file.destination,
      path: req.file.path,
    }),
  );
  return res.json({ message: "uploaded", docId, filename: req.file.originalname, });
});

app.listen(PORT, () => {
  console.log(`Server starting on ${PORT}`);
});
