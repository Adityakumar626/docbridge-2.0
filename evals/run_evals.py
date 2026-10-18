#!/usr/bin/env python3
"""
DocBridge 2.0 - Standalone DeepEval Runner
Usage:
    python run_evals.py
    python run_evals.py "What is the primary topic of the document?"
"""

import sys
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

import requests
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric, GEval

DOCBRIDGE_API_URL = os.getenv("DOCBRIDGE_API_URL", "http://localhost:8000")
EVAL_MODEL = os.getenv("DEEPEVAL_MODEL", "gemini-3.5-flash-lite")

def evaluate_query(query: str, doc_id: str = None):
    print(f"\n" + "="*60)
    print(f"🔍 Testing Query: '{query}'")
    print("="*60)

    try:
        params = {"message": query}
        if doc_id:
            params["docId"] = doc_id
        res = requests.get(f"{DOCBRIDGE_API_URL}/chat", params=params, timeout=30).json()
    except Exception as e:
        print(f"❌ Failed to connect to DocBridge API at {DOCBRIDGE_API_URL}: {e}")
        print("Please ensure your backend is running (`npm run dev` or `docker compose up`).")
        return

    answer = res.get("answer", "")
    sources = res.get("source", [])
    contexts = [s.get("pageContent", "") for s in sources]

    print(f"\n💬 Generated Answer:\n{answer}")
    print(f"\n📚 Retrieved Chunks: {len(contexts)}")
    for i, s in enumerate(sources):
        page = s.get("metadata", {}).get("pageNumber", "N/A")
        preview = s.get("pageContent", "")[:100].replace("\n", " ")
        print(f"   [{i+1}] Page {page}: {preview}...")

    if not contexts:
        print("\n⚠️ No context retrieved. Skipping evaluation.")
        return

    print("\n⏳ Running DeepEval Metrics (LLM Judge: " + EVAL_MODEL + ")...")
    test_case = LLMTestCase(
        input=query,
        actual_output=answer,
        retrieval_context=contexts,
    )

    faithfulness = FaithfulnessMetric(threshold=0.7, model=EVAL_MODEL)
    relevancy = AnswerRelevancyMetric(threshold=0.7, model=EVAL_MODEL)
    citation = GEval(
        name="Citation Adherence",
        criteria="Evaluate if facts are cited with [Source X | Page Y] format and sources match the context.",
        evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.RETRIEVAL_CONTEXT],
        threshold=0.7,
        model=EVAL_MODEL,
    )

    metrics = [
        ("Faithfulness (No Hallucinations)", faithfulness),
        ("Answer Relevancy", relevancy),
        ("Citation Adherence", citation),
    ]

    import time

    print("\n📊 Evaluation Results:")
    print("-" * 60)
    for name, metric in metrics:
        try:
            metric.measure(test_case)
            score = metric.score
            passed = "✅ PASS" if metric.is_successful() else "❌ FAIL"
            reason = getattr(metric, "reason", "N/A")
            print(f"{passed} | {name}: {score:.2f} / 1.00")
            if reason and reason != "N/A":
                print(f"       Reason: {reason}")
            time.sleep(2)  # Pause to respect Gemini Free Tier 15 RPM
        except Exception as err:
            print(f"⚠️ Error evaluating {name}: {err}")
    print("-" * 60)

if __name__ == "__main__":
    default_query = sys.argv[1] if len(sys.argv) > 1 else "What is GST and what are its main features?"
    evaluate_query(default_query)
