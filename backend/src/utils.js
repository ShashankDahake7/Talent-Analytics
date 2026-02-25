// Milliseconds in one month (30-day approximation)
export const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30;

// Computes the cosine similarity between two numeric vectors.
// Returns 0 if either vector is null/undefined, empty, or zero-magnitude.
// @param {number[]} a
// @param {number[]} b
// @returns {number} value in [0, 1]
export function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < a.length; i += 1) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}