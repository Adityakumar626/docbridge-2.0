import express from "express";
import "dotenv/config";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import { Queue } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { generateSparseVector } from "./lib/bm25.js";

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
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
const port = 8000;
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (req, res) => {
  return res.json({ status: "all good, working!" });
});

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
    url: "http://localhost:6333",
  });

  // Check Collection Status
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some((c) => c.name === "pdf-docs");

  if (!exists) {
    return res.json({ answer: "No documents uploaded yet.", source: [] });
  }

  // 1. Generate both Dense and Sparse representations for the query
  const [denseVector, sparseVector] = await Promise.all([
    embeddings.embedQuery(userQuery),
    Promise.resolve(generateSparseVector(userQuery)), // using Promise.resolve() allows them to be handled togethers
  ]);

  // 2. Optional: Filter by specific document if docId is passed
  const filter = docId ? {
    must: [{
      key: "metadata.docId",
      match: { value: docId }
    }]
  } : undefined;

  // 3. Hybrid Search with RRF (Reciprocal Rank Fusion):
  const searchResults = await qdrantClient.query("pdf-docs", {
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
          values: sparseVector.values
        },
        using: "sparse",
        limit: 15,
        filter,
      }
    ],
    query: {
      fusion: 'rrf' // Native Reciprocal Rank Fusion
    },
    limit: 5,
    with_payload: true
  })

  // 4. Format the retrieved chunks for the prompt and frontend
  const retreivedDocs = searchResults.points.map((p) => ({
    pageContent: p.payload.pageContent || '',
    metadata: p.payload.metadata || {},
    score: p.score
  }))

  // 5. Build Grounded Prompt with Page Citations
  const contextText = retreivedDocs
    .map(
      (doc, i) =>
        `Source ${i + 1} | Page ${doc.metadata?.pageNumber ||
        "N/A"}\n${doc.pageContent}`
    )
    .join("\n");

  const SYSTEM_PROMPT = `
  You are Docbridge, a high-precision document intelligence assistant.
  Answer the user's question using ONLY the provided PDF context below.
  Do not make up facts. Always mention the source/page number if available.
  
  Context:
  ${contextText}
  If the answer is not found in the PDF, say: "I couldn't find the answer in the document."`;


  // 6. Generate Answer with gemini
  const chatResult = await client.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
    contents: userQuery,
  });

  return res.json({
    answer: chatResult.text,
    source: retreivedDocs,
  });
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

app.listen(port, () => {
  console.log(`Server starting on ${port}`);
});
