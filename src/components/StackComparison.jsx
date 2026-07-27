import React, { useState } from 'react';
import { RefreshCw, Layers, Plus, X } from 'lucide-react';
import { callGemini, buildComparePrompt } from '../lib/gemini';

// Module 8: Stack Comparison
// Compares 2-3 tech stacks across Difficulty, Learning Curve, Deployment,
// Performance, Maintainability, Community, Hosting Cost and Time.

const ROWS = [
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'learningCurve', label: 'Learning Curve' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'performance', label: 'Performance' },
  { key: 'maintainability', label: 'Maintainability' },
  { key: 'community', label: 'Community' },
  { key: 'hostingCost', label: 'Hosting Cost' },
  { key: 'time', label: 'Time to MVP' },
];

export default function StackComparison() {
  const [stacks, setStacks] = useState(['MERN (MongoDB, Express, React, Node)', 'Next.js + Supabase']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const updateStack = (i, value) => {
    setStacks((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  };

  const addStack = () => {
    if (stacks.length < 3) setStacks((prev) => [...prev, '']);
  };

  const removeStack = (i) => {
    setStacks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { systemPrompt, userPrompt } = buildComparePrompt(stacks);
      const json = await callGemini(systemPrompt, userPrompt);
      setResult(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center gap-2 justify-center">
          <Layers className="w-5 h-5" /> Stack Duel
        </h2>
        <p className="text-xs text-slate-400 mb-6 text-center">
          Compare 2-3 stacks head to head: difficulty, learning curve, deployment, performance, maintainability, community, hosting cost and time.
        </p>

        {error && <p className="text-xs text-rose-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleCompare} className="max-w-3xl mx-auto space-y-3">
          {stacks.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 w-6 shrink-0">{String.fromCharCode(65 + i)}</span>
              <input
                type="text"
                required
                value={s}
                onChange={(e) => updateStack(i, e.target.value)}
                placeholder={`Stack ${String.fromCharCode(65 + i)} (e.g. MERN)`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
              />
              {stacks.length > 2 && (
                <button type="button" onClick={() => removeStack(i)} className="text-slate-500 hover:text-rose-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-1">
            {stacks.length < 3 && (
              <button
                type="button"
                onClick={addStack}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                <Plus className="w-3 h-3" /> Add a third stack
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition mt-2 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Run Comparison Duel'}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-2xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3 text-slate-500 font-medium">Metric</th>
                  {result.stacks.map((s, i) => (
                    <th key={i} className="text-left p-3 text-indigo-400 font-semibold">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-slate-900">
                    <td className="p-3 text-slate-400">{row.label}</td>
                    {result.stacks.map((s, i) => (
                      <td key={i} className="p-3 text-slate-200">{s[row.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.stacks.map((s, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <h4 className="text-sm font-bold text-cyan-400 mb-2">{s.name}</h4>
                <p className="text-[11px] font-semibold text-emerald-400 mb-1">Pros</p>
                <ul className="text-xs text-slate-300 space-y-1 mb-3">
                  {s.pros.map((p, pi) => <li key={pi}>• {p}</li>)}
                </ul>
                <p className="text-[11px] font-semibold text-rose-400 mb-1">Cons</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {s.cons.map((c, ci) => <li key={ci}>• {c}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 border border-emerald-900/40 p-5 rounded-2xl text-center">
            <h4 className="text-sm font-semibold text-emerald-400 mb-1">Architect's Verdict</h4>
            <p className="text-xs text-slate-300 max-w-2xl mx-auto">{result.verdict}</p>
          </div>
        </div>
      )}
    </div>
  );
}
