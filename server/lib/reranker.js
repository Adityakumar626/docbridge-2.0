// jsDocs
/** 
* @param {import("@google/genai").GoogleGenAI} client - The GoogleGenAI client
* @param {string} query - The user query
* @param {Array<{pageContent : string , metadata : object , score : number}>} candidates - Chunks form Qdrant
* @param {number} topK - Number of top chunks to return 
* @return {Promise<{goldenDocs : Array<any>,hasSufficientContext : boolean}>}
*/

export async function rerankCandidates(client, query, candidates, topK = 3) {
    if (!candidates || candidates.length === 0) {
        return { goldenDocs: [], hasSufficientContext: false }
    }

    const candidateList = candidates
        .map((c, idx) => `[Candidate ${idx + 1} | Page ${c.metadata?.pageNumber || "N/A"}]\n${c.pageContent}`)
        .join("\n")


    const RERANK_PROMPT = `
You are an expert Document Retrieval Evaluator and Re-Ranker.
Analyze the following list of retrieved candidates against the user's question.
User Question: "${query}"
Candidates:
${candidateList}
Your task:
1. Score each candidate from 0.0 to 1.0 on how directly and factually it helps answer the user's question.
   - 0.8 - 1.0: Contains direct, explicit factual answers, numbers, or key definitions.
   - 0.5 - 0.7: Partial context, background, or closely related concepts.
   - 0.0 - 0.4: Irrelevant, generic boilerplate, or distracting noise.
2. Provide a 1-sentence reason for the score.
3. Determine if the overall context is sufficient to answer the question accurately without guessing.
You MUST respond strictly in valid JSON matching this schema:
{
  "hasSufficientContext": true,
  "rankedCandidates": [
    { "index": 1, "relevanceScore": 0.95, "reason": "Explicitly states the metric requested." }
  ]
}
`

    try {
        const response = await client.models.generateContent({
            model: "gemini-3.7-flash",
            config: {
                systemInstruction: "You are a strict, objective information retrieval evaluator. Output ONLY valid JSON.",
                responseMimeType: "application/json",
                temperature: 0.1, // low temp for non mock results
            },
            contents: RERANK_PROMPT,
        })

        let rawText = response.text || "";
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(rawText);

        const candidatesArray = Array.isArray(parsed?.rankedCandidates) ? parsed.rankedCandidates : [];

        const scoredDocs = candidatesArray
            .filter((item) => item.index >= 1 && item.index <= candidates.length)
            .map((item) => {
                const originalDocs = candidates[item.index - 1]; // -1 for js array indexing
                return {
                    ...originalDocs,
                    relevanceScore: item.relevanceScore,
                    rerankReason: item.reason
                }
            })

            // chunks with score above 0.6
            .filter((doc) => doc.relevanceScore > 0.6)
            // sort score by descending order
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, topK);

        return {
            goldenDocs: scoredDocs,
            hasSufficientContext: parsed.hasSufficientContext && scoredDocs.length > 0,
        }
    } catch (error) {
        console.warn("⚠️ Re-ranking evaluation failed, falling back to original candidates:", error);
        // Graceful fallback to original candidates if re-ranking fails
        return {
            goldenDocs: candidates.slice(0, topK),
            hasSufficientContext: true,
        };
    }


}
