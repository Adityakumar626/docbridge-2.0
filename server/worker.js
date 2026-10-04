import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
import { generateSparseVector } from "./lib/bm25.js"
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config();

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      const data = JSON.parse(job.data);
      console.log(`Processing PDF path: ${data.path}`);

      // 1. Load the PDF data
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();

      // 2. Chunk the PDF
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const texts = await textSplitter.splitDocuments(docs);
      console.log(`Generated ${texts.length} chunks. Connecting to Qdrant...`);

      // chunks with metadata for better citations 
      const enrichedChunks = texts.map((chunk, idx) => ({
        ...chunk,
        metadata: {
          ...chunk.metadata,
          docId: data.docId || data.filename,
          filename: data.filename,
          pageNumber: chunk.metadata?.loc?.pageNumber || 1,
          chunkIndex: idx,
        },
      }))

      // 3. Initialize Gemini Embeddings
      const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
      });

      // Compute Dense Embeddings in Batches:
      const textToEmbed = enrichedChunks.map((c) => c.pageContent); // extract only page content from the chunks
      const denseEmbeddings = await embeddings.embedDocuments(textToEmbed); // covert into dense vectors

      // Compute Sparse Embeddings with BM25:
      const sparseEmbeddings = textToEmbed.map((text) => generateSparseVector(text));

      // Construct the Qdrant Points Array: 
      const points = enrichedChunks.map((chunk, i) => ({
        id: crypto.randomUUID(),
        vector: {
          dense: denseEmbeddings[i],
          sparse: sparseEmbeddings[i],
        },
        payload: {
          pageContent: chunk.pageContent,
          metadata: chunk.metadata
        }
      }));

      // 4. Save to Qdrant
      const qdrantClient = new QdrantClient({
        url: "http://localhost:6333",
      });

      // Ensure collection exists with both Dense + Sparse vector indexes
      const collections = await qdrantClient.getCollections(); 
      const exists = collections.collections.some((c) => c.name === "pdf-docs");

      if (!exists) {
        console.log("Creating dual-vector collection 'pdf-docs'...");
        await qdrantClient.createCollection("pdf-docs", {
          vectors: {
            dense: {
              size: 768,
              distance: "Cosine",
            },
          },
          sparse_vectors: {
            sparse: {},
          },
        });
      }

      // Upsert points in a single network roundtrip
      await qdrantClient.upsert("pdf-docs", {
        wait: true,
        points,
      });

      console.log(`✅ Ingested ${points.length} hybrid chunks successfully!`);

    } catch (error) {
      console.error("❌ Error processing job in worker:", error);
      throw error; // Ensures BullMQ knows the job failed
    }
  },
  {
    concurrency: 5,
    connection: {
      host: "localhost",
      port: 6379,
    },
  },
);
