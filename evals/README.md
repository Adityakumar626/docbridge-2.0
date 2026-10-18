# DocBridge 2.0 - DeepEval Evaluation Suite

This directory contains automated RAG evaluation tests powered by [DeepEval](https://github.com/confident-ai/deepeval).

---

## What It Evaluates

1. **Faithfulness (`FaithfulnessMetric`)**: Measures whether the generated answer is strictly grounded in the retrieved PDF context, catching hallucinations.
2. **Answer Relevancy (`AnswerRelevancyMetric`)**: Measures whether the response directly addresses the user's prompt without unnecessary drift.
3. **Citation Adherence (`GEval`)**: A custom G-Eval metric that verifies facts are properly cited with `[Source X | Page Y]` matching the retrieved context.

---

## Setup

1. **Navigate to the evals folder:**
   ```bash
   cd evals
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

---

## Running Evaluations

Ensure DocBridge is running (`docker compose up` or `cd server && npm run dev`).

### Option 1: Standalone CLI Runner
Test any custom query directly from the terminal:
```bash
python run_evals.py "What are the main findings in this document?"
```

### Option 2: Automated Pytest Suite
Run the full automated test suite with DeepEval's visual summary:
```bash
deepeval test run test_docbridge.py
```
