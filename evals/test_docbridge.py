import os
import requests
import pytest
from pathlib import Path
from dotenv import load_dotenv

# Load root .env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from deepeval import assert_test
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric, GEval

DOCBRIDGE_API_URL = os.getenv("DOCBRIDGE_API_URL", "http://localhost:8000")
EVAL_MODEL = os.getenv("DEEPEVAL_MODEL", "gemini-3.5-flash-lite")

# 1. Custom G-Eval Metric: Validates inline citation fidelity and formatting
citation_metric = GEval(
    name="Inline Citation Adherence",
    criteria=(
        "Assess whether the answer includes inline page citations using the format [Source X | Page Y]. "
        "Every factual claim from the retrieval context should be attributed to its corresponding source and page number. "
        "The response must not fabricate source numbers that do not exist in the context."
    ),
    evaluation_params=[
        LLMTestCaseParams.INPUT,
        LLMTestCaseParams.ACTUAL_OUTPUT,
        LLMTestCaseParams.RETRIEVAL_CONTEXT,
    ],
    threshold=0.7,
    model=EVAL_MODEL,
)

def query_docbridge(message: str, doc_id: str = None) -> dict:
    """Helper to query the running DocBridge Express API."""
    params = {"message": message}
    if doc_id:
        params["docId"] = doc_id
    response = requests.get(f"{DOCBRIDGE_API_URL}/chat", params=params, timeout=30)
    response.raise_for_status()
    return response.json()

# Test queries to benchmark retrieval accuracy and hallucination resistance
SAMPLE_TEST_QUERIES = [
    ("What is GST and what are its main features?", None),
]

@pytest.mark.parametrize("query, doc_id", SAMPLE_TEST_QUERIES)
def test_docbridge_rag_quality(query, doc_id):
    """
    Evaluates:
    1. Faithfulness (Did Gemini hallucinate or stick to PDF chunks?)
    2. Answer Relevancy (Did it directly answer the user's question?)
    3. Citation Adherence (Did it cite [Source X | Page Y] correctly?)
    """
    res = query_docbridge(query, doc_id)
    actual_output = res.get("answer", "")
    sources = res.get("source", [])
    retrieval_context = [doc.get("pageContent", "") for doc in sources]

    assert actual_output, "DocBridge API returned an empty answer."
    assert len(retrieval_context) > 0, "No chunks were retrieved from Qdrant."

    test_case = LLMTestCase(
        input=query,
        actual_output=actual_output,
        retrieval_context=retrieval_context,
    )

    faithfulness = FaithfulnessMetric(threshold=0.7, model=EVAL_MODEL)
    relevancy = AnswerRelevancyMetric(threshold=0.7, model=EVAL_MODEL)

    assert_test(test_case, [faithfulness, relevancy, citation_metric])
