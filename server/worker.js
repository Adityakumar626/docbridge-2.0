import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";

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

      // 4. Save to Qdrant
      const vectorStore = new QdrantVectorStore(
        embeddings,
        {
          url: "http://localhost:6333",
          collectionName: "pdf-docs",
        },
      );

      await vectorStore.ensureCollection();

      // now adding real chunks with metadata to db 
      await vectorStore.addDocuments(enrichedChunks);
      console.log("✅ All chunks with metadata successfully added to Qdrant vector store!");

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
