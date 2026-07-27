import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, ShieldCheck, BarChart2, Layers, CheckSquare,
  RefreshCw, Save, Printer, FolderOpen, Map,
} from 'lucide-react';

import { callGemini, buildAuditPrompt } from './lib/gemini';
import { listSavedProjects, saveProject, deleteProject } from './lib/storage';

import ProjectInputForm from './components/ProjectInputForm';
import AuditReport from './components/AuditReport';
import TechAdvisor from './components/TechAdvisor';
import StackComparison from './components/StackComparison';
import RoadmapAndStructure from './components/RoadmapAndStructure';
import ProgressTracker from './components/ProgressTracker';
import SavedProjects from './components/SavedProjects';

const TABS = [
  { id: 'audit', label: 'Risk Audit', icon: BarChart2 },
  { id: 'compare', label: 'Stack Duel', icon: Layers },
  { id: 'roadmap', label: 'Roadmap', icon: Map, requiresAudit: true },
  { id: 'tracker', label: 'Tracker', icon: CheckSquare, requiresAudit: true },
  { id: 'saved', label: 'Saved', icon: FolderOpen },
];

function defaultForm() {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 28);
  return {
    projectTitle: '',
    description: '',
    preferredStack: 'React, Node.js, Express, MongoDB',
    teamSize: 1,
    dailyHours: 3,
    skillLevel: 'Intermediate',
    deadline: deadline.toISOString().slice(0, 10),
    timelineWeeks: 4,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('audit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Module 1: Project Input
  const [form, setForm] = useState(defaultForm());

  // Module 2-10: Audit result (includes tech advisor, roadmap, github structure)
  const [auditData, setAuditData] = useState(null);

  // Module 13: Progress tracker state
  const [completedTasks, setCompletedTasks] = useState({});
  const [dailyLogs, setDailyLogs] = useState([]);

  // Module 15: Saved projects
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    setSavedProjects(listSavedProjects());
  }, []);

  // Recompute timeline (in weeks) whenever the deadline changes
  useEffect(() => {
    if (!form.deadline) return;
    const today = new Date();
    const deadlineDate = new Date(form.deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const weeks = Math.max(1, Math.round(diffDays / 7));
    setForm((prev) => (prev.timelineWeeks === weeks ? prev : { ...prev, timelineWeeks: weeks }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.deadline]);

  const handleAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { systemPrompt, userPrompt } = buildAuditPrompt(form);
      const json = await callGemini(systemPrompt, userPrompt);
      setAuditData({ ...json, projectTitle: form.projectTitle });
      setCompletedTasks({});
      setDailyLogs([]);
      setCurrentProjectId(null);
      setActiveTab('audit');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Module 15: Save current audit snapshot
  const handleSaveProject = () => {
    if (!auditData) return;
    const record = saveProject({
      id: currentProjectId,
      form,
      auditData,
      completedTasks,
      dailyLogs,
    });
    setCurrentProjectId(record.id);
    setSavedProjects(listSavedProjects());
  };

  const handleLoadProject = (p) => {
    setForm(p.form);
    setAuditData(p.auditData);
    setCompletedTasks(p.completedTasks || {});
    setDailyLogs(p.dailyLogs || []);
    setCurrentProjectId(p.id);
    setActiveTab('audit');
  };

  const handleDeleteProject = (id) => {
    deleteProject(id);
    setSavedProjects(listSavedProjects());
    if (id === currentProjectId) setCurrentProjectId(null);
  };

  // Module 14: Export PDF via the browser's native print-to-PDF.
  // The report is rendered into a dedicated #print-area that always exists
  // in the DOM (regardless of which tab is on screen), so exporting works
  // no matter what tab the user is looking at when they click the button.
  const handleExportPdf = () => window.print();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Print-only styling for Module 14 (Export PDF) */}
      <style>{`
        #print-area { display: none; }
        @media print {
          .screen-only { display: none !important; }
          #print-area { display: block !important; }
        }
      `}</style>

      {/* Everything below is the normal on-screen app; hidden entirely when printing */}
      <div className="screen-only">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  ProjectPilot AI
                </h1>
                <p className="text-xs text-slate-400">Project Risk Auditor & Stack Architecture Studio</p>
              </div>
            </div>

            <nav className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-800">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const disabled = tab.requiresAudit && !auditData;
                return (
                  <button
                    key={tab.id}
                    onClick={() => !disabled && setActiveTab(tab.id)}
                    disabled={disabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      disabled
                        ? 'opacity-40 cursor-not-allowed text-slate-500'
                        : activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </nav>

            {auditData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveProject}
                  className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg"
                >
                  <Save className="w-3.5 h-3.5" /> Save Project
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-rose-950/50 border border-rose-800 rounded-xl flex items-center gap-3 text-rose-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* TAB: RISK AUDIT (Modules 1-7) */}
          {activeTab === 'audit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <ProjectInputForm form={form} setForm={setForm} onSubmit={handleAudit} loading={loading} />
              </div>

              <div className="lg:col-span-7 space-y-6">
                {!auditData ? (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
                    <p className="text-base font-medium">No Audit Report Generated Yet</p>
                    <p className="text-xs text-slate-600 mt-1">Fill in your project details on the left to predict risks, missing requirements, and GitHub blueprints.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-100">{auditData.projectTitle}</h2>
                    <AuditReport auditData={auditData} />
                    <TechAdvisor technologyAdvisor={auditData.technologyAdvisor} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: STACK DUEL (Module 8) */}
          {activeTab === 'compare' && <StackComparison />}

          {/* TAB: ROADMAP (Modules 9-10) */}
          {activeTab === 'roadmap' && auditData && <RoadmapAndStructure auditData={auditData} />}

          {/* TAB: PROGRESS TRACKER (Modules 11-13) */}
          {activeTab === 'tracker' && auditData && (
            <ProgressTracker
              auditData={auditData}
              completedTasks={completedTasks}
              toggleTask={toggleTask}
              dailyLogs={dailyLogs}
              setDailyLogs={setDailyLogs}
            />
          )}

          {/* TAB: SAVED PROJECTS (Module 15) */}
          {activeTab === 'saved' && (
            <SavedProjects projects={savedProjects} onLoad={handleLoadProject} onDelete={handleDeleteProject} />
          )}
        </main>
      </div>
      {/* end .screen-only */}

      {/* Module 14: dedicated print block — always in the DOM (independent
          of whichever tab is active on screen) so Export PDF works no
          matter where the user clicked it from. Hidden on screen, shown
          only by the @media print rule above. */}
      {auditData && (
        <div id="print-area" className="bg-white text-black p-8">
          <h1 className="text-2xl font-bold mb-1">{auditData.projectTitle}</h1>
          <p className="text-xs text-slate-600 mb-6">ProjectPilot AI report generated {new Date().toLocaleDateString()}</p>
          <div className="[&_*]:!bg-white [&_*]:!text-black [&_*]:!border-slate-300">
            <AuditReport auditData={auditData} />
            <div className="mt-6">
              <TechAdvisor technologyAdvisor={auditData.technologyAdvisor} />
            </div>
            <div className="mt-6">
              <RoadmapAndStructure auditData={auditData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}