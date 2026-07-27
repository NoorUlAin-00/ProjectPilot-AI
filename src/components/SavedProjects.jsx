import React from 'react';
import { FolderOpen, Trash2, Download } from 'lucide-react';

// Module 15: Saved Projects
// Lists every audit snapshot saved to localStorage and lets the user
// reload it back into the app or delete it.

export default function SavedProjects({ projects, onLoad, onDelete }) {
  if (!projects.length) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-950/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500">
        <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
        <p className="text-base font-medium">No Saved Projects Yet</p>
        <p className="text-xs text-slate-600 mt-1">Run an audit, then hit "Save Project" to revisit it here later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">{p.form.projectTitle}</p>
            <p className="text-[11px] text-slate-500">
              Saved {new Date(p.savedAt).toLocaleString()} · Risk {p.auditData.riskScore}% · Completion {p.auditData.completionProbability}%
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onLoad(p)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg"
            >
              <Download className="w-3.5 h-3.5" /> Load
            </button>
            <button
              onClick={() => onDelete(p.id)}
              className="text-slate-500 hover:text-rose-400 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
