import React from 'react';
import { Cpu } from 'lucide-react';

// Module 7: Technology Advisor
// Shows AI-suggested technologies for the project, each with a "why".

export default function TechAdvisor({ technologyAdvisor }) {
  if (!technologyAdvisor?.length) return null;

  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2 mb-4">
        <Cpu className="w-4 h-4" /> Technology Advisor
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {technologyAdvisor.map((t, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-sm font-bold text-cyan-400 mb-1">{t.tech}</p>
            <p className="text-xs text-slate-300">{t.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
