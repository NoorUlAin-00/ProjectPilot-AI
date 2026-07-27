import React, { useMemo, useState } from 'react';
import { Award, Calendar, CheckSquare, Rocket, Plus, Trash2 } from 'lucide-react';
import { TESTING_ITEMS, DEPLOYMENT_ITEMS } from '../lib/gemini';

// Modules 11 + 12 + 13
// Testing Checklist, Deployment Checklist and the interactive Progress
// Tracker that recalculates risk / completion / timeline live as the user
// checks off tasks and logs daily standup notes.

function getAllTaskIds(auditData) {
  const ids = [];
  auditData.weeklyMilestones.forEach((m, mi) => m.tasks.forEach((_, ti) => ids.push(`m_${mi}_${ti}`)));
  TESTING_ITEMS.forEach((_, i) => ids.push(`test_${i}`));
  DEPLOYMENT_ITEMS.forEach((_, i) => ids.push(`deploy_${i}`));
  return ids;
}

export default function ProgressTracker({ auditData, completedTasks, toggleTask, dailyLogs, setDailyLogs }) {
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');

  const allTaskIds = useMemo(() => getAllTaskIds(auditData), [auditData]);
  const completedCount = allTaskIds.filter((id) => completedTasks[id]).length;
  const progressPct = allTaskIds.length > 0 ? completedCount / allTaskIds.length : 0;
  const readinessScore = Math.round(progressPct * 100);

  // Live re-projection: a lightweight client-side heuristic (not another AI
  // call) that blends the original audit numbers with how much work is
  // actually checked off, so risk drops and completion odds rise as tasks
  // get done.
  const liveRisk = Math.max(5, Math.round(auditData.riskScore * (1 - progressPct * 0.6)));
  const liveCompletion = Math.min(
    99,
    Math.round(auditData.completionProbability + progressPct * (100 - auditData.completionProbability) * 0.7)
  );
  const liveTimeline = Math.max(1, Math.round(auditData.estimatedTimeWeeks * (1 - progressPct * 0.5)));

  const addLog = () => {
    if (!yesterday.trim() && !today.trim()) return;
    setDailyLogs((prev) => [
      { id: `log_${Date.now()}`, date: new Date().toLocaleDateString(), yesterday, today },
      ...prev,
    ]);
    setYesterday('');
    setToday('');
  };

  const removeLog = (id) => setDailyLogs((prev) => prev.filter((l) => l.id !== id));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Live score header */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <Award className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Readiness</p>
          <p className="text-xl font-extrabold text-indigo-400">{readinessScore}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Live Risk</p>
          <p className="text-xl font-extrabold text-rose-400">{liveRisk}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Live Completion</p>
          <p className="text-xl font-extrabold text-emerald-400">{liveCompletion}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-1">Live Timeline</p>
          <p className="text-xl font-extrabold text-cyan-400">{liveTimeline} wks</p>
        </div>
      </div>

      {/* Daily log — Module 13 "feels alive" piece */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4" /> Daily Standup Log
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={yesterday}
            onChange={(e) => setYesterday(e.target.value)}
            placeholder="Yesterday, e.g. Login"
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none"
          />
          <input
            type="text"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            placeholder="Today, e.g. CRUD"
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none"
          />
        </div>
        <button
          onClick={addLog}
          className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 mb-4"
        >
          <Plus className="w-3 h-3" /> Add log entry
        </button>

        {dailyLogs.length > 0 && (
          <div className="space-y-2">
            {dailyLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-slate-900/60 rounded-xl p-3 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500">{log.date}</span>{' '}
                  {log.yesterday && <span>— Yesterday: <span className="text-slate-100">{log.yesterday}</span></span>}{' '}
                  {log.today && <span>— Today: <span className="text-slate-100">{log.today}</span></span>}
                </div>
                <button onClick={() => removeLog(log.id)} className="text-slate-600 hover:text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly milestone checklist */}
      <div className="space-y-4">
        {auditData.weeklyMilestones.map((m, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {m.week}: {m.title}
            </h3>
            <div className="space-y-2">
              {m.tasks.map((task, tIdx) => {
                const taskId = `m_${idx}_${tIdx}`;
                return (
                  <label key={tIdx} className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl hover:bg-slate-900 transition cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!completedTasks[taskId]}
                      onChange={() => toggleTask(taskId)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <span className={completedTasks[taskId] ? 'line-through text-slate-500' : ''}>{task}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Module 11: Testing Checklist */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" /> Testing Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TESTING_ITEMS.map((item, i) => {
            const taskId = `test_${i}`;
            return (
              <label key={i} className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl hover:bg-slate-900 transition cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={!!completedTasks[taskId]}
                  onChange={() => toggleTask(taskId)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-800 border-slate-700"
                />
                <span className={completedTasks[taskId] ? 'line-through text-slate-500' : ''}>{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Module 12: Deployment Checklist */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
        <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
          <Rocket className="w-4 h-4" /> Deployment Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEPLOYMENT_ITEMS.map((item, i) => {
            const taskId = `deploy_${i}`;
            return (
              <label key={i} className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl hover:bg-slate-900 transition cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={!!completedTasks[taskId]}
                  onChange={() => toggleTask(taskId)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-slate-800 border-slate-700"
                />
                <span className={completedTasks[taskId] ? 'line-through text-slate-500' : ''}>{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
