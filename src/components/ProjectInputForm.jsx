import React from 'react';
import { RefreshCw, ArrowRight, Sparkles } from 'lucide-react';

// Module 1: Project Input
// Collects Project Title, Description, Team Size, Deadline, Skill Level,
// Daily Hours and Preferred Stack, then derives a timeline in weeks.

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProjectInputForm({ form, setForm, onSubmit, loading }) {
  const update = (field) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl h-fit">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-400">
        <Sparkles className="w-5 h-5" /> Audit Your Project
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Project Title</label>
          <input
            type="text"
            required
            placeholder="e.g. AI Study Assistant"
            value={form.projectTitle}
            onChange={update('projectTitle')}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Project Description & Scope</label>
          <textarea
            required
            rows={4}
            placeholder="Describe core features, user roles, APIs..."
            value={form.description}
            onChange={update('description')}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Preferred Tech Stack</label>
          <input
            type="text"
            required
            placeholder="e.g. React, Node.js, Express, MongoDB"
            value={form.preferredStack}
            onChange={update('preferredStack')}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Team Size</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.teamSize}
              onChange={update('teamSize')}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Daily Hours</label>
            <input
              type="number"
              min={1}
              max={16}
              value={form.dailyHours}
              onChange={update('dailyHours')}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Skill Level</label>
            <select
              value={form.skillLevel}
              onChange={update('skillLevel')}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
            >
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Deadline</label>
            <input
              type="date"
              required
              value={form.deadline}
              onChange={update('deadline')}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Timeline: <span className="text-slate-300 font-medium">{form.timelineWeeks} week(s)</span> until deadline (auto-calculated)
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 mt-4"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Run Risk Audit <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}
