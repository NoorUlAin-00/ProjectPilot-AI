import React from 'react';
import { Calendar, GitBranch } from 'lucide-react';

// Module 9: Roadmap Generator (week-by-week preview)
function Roadmap({ weeklyMilestones }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4" /> Roadmap
      </h3>
      <div className="space-y-3">
        {weeklyMilestones.map((m, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-400 mb-1">{m.week}: {m.title}</p>
            <ul className="text-xs text-slate-300 space-y-1">
              {m.tasks.map((t, ti) => <li key={ti}>• {t}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// Module 10: GitHub Structure — AI-generated recommended folder tree
function GithubStructure({ githubStructure }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
        <GitBranch className="w-4 h-4 text-indigo-400" /> Recommended GitHub Folder Structure
      </h3>
      <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 whitespace-pre-wrap">
        {githubStructure}
      </pre>
    </div>
  );
}

export default function RoadmapAndStructure({ auditData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Roadmap weeklyMilestones={auditData.weeklyMilestones} />
      <GithubStructure githubStructure={auditData.githubStructure} />
    </div>
  );
}
