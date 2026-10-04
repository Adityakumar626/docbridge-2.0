<div align="center">

# 🌉 DocBridge 2.0

### Deterministic, Citation-Backed Document Intelligence Powered by Hybrid Dense + Sparse RAG

[![Version: 2.0.0](https://img.shields.io/badge/Release-v2.0.0-emerald.svg?style=for-the-badge)](https://github.com/Adityakumar626/docbridge-2.0)
[![Next.js: 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Docker: Ready](https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Qdrant: Hybrid](https://img.shields.io/badge/Qdrant-Dense_%2B_BM25-DC2626?style=for-the-badge&logo=qdrant)](https://qdrant.tech/)

</div>



## 📌 Overview

**DocBridge 2.0** is an enterprise-grade, open-source document intelligence system built to eliminate hallucinations when analyzing complex technical papers, regulatory filings, financial statements, and contracts. 

Unlike naive RAG systems that rely solely on dense semantic search, DocBridge 2.0 combines **dense 3072-dimensional vector embeddings** with **sparse BM25 lexical token matching** using **Reciprocal Rank Fusion (RRF)**, backed by a **Cross-Encoder listwise reranker** and **Corrective RAG (CRAG)** evaluation.

Every response is grounded with **interactive page-level citation badges** that allow users to inspect exact source excerpts and verified page numbers with one click.

---

<a id="key-features"></a>
## ✨ Key Features

- 🔍 **Hybrid Retrieval (Dense + BM25)**: Combines dense embeddings with algorithmic FNV-1a BM25 sparse vectors via Reciprocal Rank Fusion (RRF) to eliminate keyword misses (IDs, numbers, acronyms).
- 🎯 **Listwise Cross-Encoder Reranker**: Grades and filters candidate passages dynamically, eliminating irrelevant noise before prompt generation.
- 🛡️ **Corrective RAG (CRAG) Guard**: Checks passage sufficiency before answering. If evidence is missing, it refuses to guess.
- 📌 **Page-Level Grounded Citations**: Inline badges (`Source 1 • Page 4`) link directly to a slide-out drawer displaying verified quoted snippets.
- ⚡ **Single-Model Reasoning**: Powered by Google's designated flagship reasoning model (`gemini-3.7-flash`) with zero unpredictable fallback loops.
- 📂 **Active Document Scoping**: Query across all indexed documents or isolate queries to a specific uploaded PDF.
- 🚀 **Full Docker Orchestration**: One command (`docker compose up -d --build`) orchestrates Valkey/Redis, Qdrant, Express API, BullMQ Worker, and the Next.js frontend.
- 🎨 **Minimalist UI**: Built with Tailwind CSS, Next.js 16, animated pipeline visualization, and smooth dark/light theme toggle.

---

<a id="architecture"></a>
## 🏗️ Architecture

```
                                  [ User Browser ]
                                         │
                             ┌───────────▼───────────┐
                             │  Next.js 16 Frontend  │ (Port 3000)
                             └───────────┬───────────┘
                                         │ HTTP
                             ┌───────────▼───────────┐
                             │   Express REST API    │ (Port 8000)
                             └─────┬───────────┬─────┘
                     Uploads PDF   │           │ Queries
                                   ▼           ▼
        ┌────────────────────────────┐       ┌────────────────────────────┐
        │     Valkey/Redis Queue     │       │    Qdrant Vector Database  │
        │   (file-upload-queue:6379) │       │   (Dense 3072d + BM25:6333)│
        └──────────────┬─────────────┘       └─────────────▲──────────────┘
                       │ Consume Jobs                      │ Upserts
                       ▼                                   │
        ┌────────────────────────────┐                     │
        │    BullMQ Background       ├─────────────────────┘
        │    Processing Worker       │ (Shared Volume: /app/uploads)
        └────────────────────────────┘
```

---

## 🛠️ Tech Stack & Tags

| Layer | Technologies & Tags |
| :--- | :--- |
| **Frontend** | `Next.js 16` • `React 19` • `TypeScript` • `Tailwind CSS 4` • `Clerk Auth` • `Lucide Icons` • `Framer Motion` |
| **Backend API** | `Express.js` • `Node.js 20` • `Multer` • `CORS` • `LangChain` |
| **AI & Embeddings** | `Google Gemini 3.7 Flash` • `gemini-embedding-001` (3072d) • `BM25 Sparse Algorithm` |
| **Data & Queues** | `Qdrant v1.13` (Dual Vector Engine) • `Valkey / Redis 8` • `BullMQ v6` |
| **DevOps & Infra** | `Docker Compose` • `Multi-stage Dockerfiles` • `Bridge Networks` • `Healthchecks` |

---

<a id="quickstart"></a>
<a id="quickstart-with-docker-recommended"></a>
## 🚀 Quickstart with Docker (Recommended)

Run the entire 5-container stack with a single command.

### 1. Clone the repository
```bash
git clone https://github.com/Adityakumar626/docbridge-2.0.git
cd docbridge-2.0
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

```env
# Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

### 3. Launch All Services
```bash
docker compose up -d --build
```

### 4. Access the Application
- **DocBridge 2.0 Web Interface**: [http://localhost:3000](http://localhost:3000)
- **API Health Endpoint**: [http://localhost:8000/](http://localhost:8000/)
- **Qdrant Vector Dashboard**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

To view logs:
```bash
docker compose logs -f
```

To stop all containers:
```bash
docker compose down
```

---

<a id="local-setup"></a>
<a id="local-development"></a>
<a id="local-development-setup"></a>
## 💻 Local Development Setup

If you prefer running services directly on your host machine:

### Prerequisites
- Node.js `20.x` or higher
- Docker (for Valkey and Qdrant)
- Google Gemini API Key

### 1. Start Infrastructure (Databases)
```bash
docker compose up -d redis qdrant
```

### 2. Setup & Start Backend Server
```bash
cd server
npm install
```
Create `server/.env`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
PORT=8000
REDIS_HOST=localhost
REDIS_PORT=6379
QDRANT_URL=http://localhost:6333
```
Start the API and background worker in separate terminals:
```bash
# Terminal 1: Express API Server
npm run dev

# Terminal 2: BullMQ Document Worker
npm run dev:worker
```

### 3. Setup & Start Frontend Client
```bash
cd ../client
npm install
```
Create `client/.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```
Start the Next.js development server:
```bash
npm run dev
```

---

<a id="api-reference"></a>
<a id="api-endpoints"></a>
## 📡 API Reference

### 1. Ingest PDF Document
`POST /upload/pdf`
- **Body**: `multipart/form-data` with `pdf` file attachment.
- **Response**:
```json
{
  "message": "uploaded",
  "docId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "filename": "quarterly-report.pdf"
}
```

### 2. Grounded Chat Query
`GET /chat?message=<query>&docId=<optional-doc-id>`
- **Parameters**:
  - `message` (required): Natural language question.
  - `docId` (optional): Filter retrieval strictly to this document.
- **Response**:
```json
{
  "answer": "Operating revenue increased by 14% [Source 1 | Page 12].",
  "source": [
    {
      "pageContent": "Total operating revenue reached $4.2B, an increase of 14% YoY...",
      "metadata": {
        "pageNumber": 12,
        "filename": "quarterly-report.pdf",
        "docId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      }
    }
  ]
}
```

### 3. Document History & Management
- `GET /documents`: List all indexed documents with chunk count and page numbers.
- `DELETE /documents/:docId`: Remove all vector chunks belonging to `docId` from Qdrant.

---

## 🔒 Security & Best Practices

- **Zero Hallucination Guardrails**: CRAG ensures non-answers are delivered whenever documents lack sufficient proof.
- **Isolated Vector Storage**: Vectors are namespaced and query-filterable by `docId`.
- **Non-Root Containers**: Client and Server containers adhere to Docker least-privilege security principles.
- **Environment Isolation**: `.dockerignore` and `.gitignore` safeguard secret keys from repository leakage.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Adityakumar626">Aditya Kumar</a></sub>
</div>
