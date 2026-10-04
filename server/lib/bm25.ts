// A standard set of English stopwords to filter out meaningless noise
// using this because they don't provide efficient retrieval signal

const STOPWORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
    "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me",
    "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only",
    "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
    "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then",
    "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
    "will", "with", "would", "you", "your", "yours", "yourself", "yourselves"
]);

// using (FNV-1A) for tokenizing the strings in the chunks
function hashToken(token: string): number {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
        hash ^= token.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0; // Ensure unsigned 32-bit integer
}

// JSDoc 
/**
 * @param {string} text - The chunk or query text
 * @param {number} k1 - BM25 term frequency saturation parameter
 * term frequency (tf) - How many times does the word appear in the document?
 * 
 * @returns {{ indices: number[], values: number[] }}
 */

export function generateSparseVector(text: string, k1 = 1.2) {
    if (!text || typeof text !== "string") {
        return { indices: [], values: [] };
    }

    // 1. Tokenizing the text 
    const tokens = text
        .toLowerCase()
        .split(/[^a-z0-9_-]/)
        .filter((token) => token.length > 1 && !STOPWORDS.has(token));

    if (tokens.length === 0) {
        return { indices: [], values: [] };
    }

    // 2. Count Term Frequencies (TF)
    const tfMap = new Map();
    for (const token of tokens) {
        tfMap.set(token, (tfMap.get(token) || 0) + 1);
    }

    // 3. calculate BM25 weights & hash indices
    const sparsePairs = []
    for (const [token, tf] of tfMap.entries()) {
        const index = hashToken(token);

        // BM25 formula:
        const weight = (tf * (k1 + 1)) / (tf + k1);
        sparsePairs.push({ index, weight: parseFloat(weight.toFixed(4)) })
    }

    // 4. Store sparse vector in ascending order (qdrant requires)
    sparsePairs.sort((a, b) => a.index - b.index)

    return {
        indices: sparsePairs.map((p) => p.index),
        values: sparsePairs.map((p) => p.weight)
    }
}
