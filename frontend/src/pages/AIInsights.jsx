import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function AIInsights() {
  const { isHR } = useAuth();
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [similarQuery, setSimilarQuery] = useState('');
  const [similarResult, setSimilarResult] = useState(null);
  const [similarLoading, setSimilarLoading] = useState(false);

  const analyzeFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackLoading(true);
    setFeedbackResult(null);
    try {
      const res = await api.post('/ai/feedback/analyze', { text: feedbackText });
      setFeedbackResult(res);
    } catch (e) {
      setFeedbackResult({ error: e.message });
    } finally {
      setFeedbackLoading(false);
    }
  };

  const findSimilar = async () => {
    if (!similarQuery.trim()) return;
    setSimilarLoading(true);
    setSimilarResult(null);
    try {
      const res = await api.get(`/ai/skills/similar?q=${encodeURIComponent(similarQuery)}&topK=8`);
      setSimilarResult(res);
    } catch (e) {
      setSimilarResult({ error: e.message });
    } finally {
      setSimilarLoading(false);
    }
  };


  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-ink-900">AI Insights</h1>
        <p className="text-ink-500 mt-1">Feedback analysis, similar skills, and embeddings</p>
      </div>

      <div className="space-y-8">
        {isHR && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Analyze feedback
            </h2>
            <p className="text-sm text-ink-500 mb-4">
              Paste a feedback snippet (e.g. from a survey) to get sentiment and themes.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Great collaboration with the team, but would like more clarity on priorities..."
              className="input min-h-[120px] resize-y"
              rows={4}
            />
            <button
              onClick={analyzeFeedback}
              disabled={feedbackLoading || !feedbackText.trim()}
              className="btn-primary mt-4"
            >
              {feedbackLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>Analyze</>
              )}
            </button>
            {feedbackResult && (
              <div className="mt-4 rounded-xl bg-ink-50 p-4 text-sm">
                {feedbackResult.error ? (
                  <p className="text-amber-700">{feedbackResult.error}</p>
                ) : (
                  <div className="space-y-2 text-ink-700">
                    {feedbackResult.sentimentScore != null && (
                      <p><span className="font-medium">Sentiment:</span> {Number(feedbackResult.sentimentScore).toFixed(2)} (-1 to 1)</p>
                    )}
                    {feedbackResult.topics?.length > 0 && (
                      <p><span className="font-medium">Topics:</span> {feedbackResult.topics.join(', ')}</p>
                    )}
                    {feedbackResult.rawText && (
                      <p className="mt-2">{feedbackResult.rawText}</p>
                    )}
                    {feedbackResult.sentimentScore == null && !feedbackResult.topics?.length && !feedbackResult.rawText && (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(feedbackResult, null, 2)}</pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Similar skills & learning
          </h2>
          <p className="text-sm text-ink-500 mb-4">
            Search for semantically similar skills and learning items. Examples: "React", "Node.js", "leadership", "data analysis".
          </p>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={similarQuery}
              onChange={(e) => setSimilarQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && findSimilar()}
              placeholder="e.g. React, Node.js, leadership"
              className="input flex-1 min-w-[200px]"
            />
            <button
              onClick={findSimilar}
              disabled={similarLoading || !similarQuery.trim()}
              className="btn-primary"
            >
              {similarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
          {similarResult && (
            <div className="mt-4 rounded-xl bg-ink-50 p-4 text-sm">
              {similarResult.error ? (
                <p className="text-amber-700">{similarResult.error}</p>
              ) : Array.isArray(similarResult) ? (
                <div className="space-y-3">
                  {similarResult.length === 0 ? (
                    <p className="text-ink-500">
                      No similar skills or learning items found. Try searching for a specific skill or technology (e.g., "React", "Node.js", "leadership").
                    </p>
                  ) : (
                    <>
                      <p className="font-medium text-ink-900 mb-2">
                        Similar skills &amp; learning ({similarResult.length} result{similarResult.length !== 1 ? 's' : ''})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {similarResult.map((s, i) => (
                          <span
                            key={s.id || i}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${s.type === 'learning_item' ? 'bg-ink-200 text-ink-800' : 'bg-sage-100 text-sage-800'
                              }`}
                            title={typeof s.score === 'number' ? `Similarity: ${s.score.toFixed(3)}` : ''}
                          >
                            {s.label ?? s.key ?? JSON.stringify(s)}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap">{JSON.stringify(similarResult, null, 2)}</pre>
              )}
            </div>
          )}
        </motion.section>

      </div>
    </div>
  );
}
