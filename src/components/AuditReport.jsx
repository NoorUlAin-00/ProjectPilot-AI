import React from 'react';
import { AlertTriangle, Cpu, ArrowDown, ShieldCheck, Wrench } from 'lucide-react';

const LEVEL_STYLES = {
  High: 'border-rose-900/50 text-rose-400 bg-rose-950/30',
  Medium: 'border-amber-900/50 text-amber-400 bg-amber-950/30',
  Low: 'border-emerald-900/50 text-emerald-400 bg-emerald-950/30',
};

// Module 2: AI Audit score cards
// function ScoreCards({ auditData }) {
//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
//       <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
//         <p className="text-xs text-slate-400 mb-1">Risk Score</p>
//         <p className={`text-2xl font-bold ${auditData.riskScore > 70 ? 'text-rose-400' : auditData.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
//           {auditData.riskScore}%
//         </p>
//       </div>
//       <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
//         <p className="text-xs text-slate-400 mb-1">Difficulty</p>
//         <p className="text-2xl font-bold text-indigo-400">{auditData.difficultyScore}/100</p>
//       </div>
//       <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
//         <p className="text-xs text-slate-400 mb-1">Completion Odds</p>
//         <p className="text-2xl font-bold text-emerald-400">{auditData.completionProbability}%</p>
//       </div>
//       <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
//         <p className="text-xs text-slate-400 mb-1">Readiness</p>
//         <p className="text-2xl font-bold text-cyan-400">{auditData.readinessScore}%</p>
//       </div>
//       <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
//         <p className="text-xs text-slate-400 mb-1">Est. Time</p>
//         <p className="text-2xl font-bold text-slate-200">{auditData.estimatedTimeWeeks} wks</p>
//       </div>
//     </div>
//   );
// }


function ScoreCards({ auditData }) {
  const riskReasons = auditData.riskAnalysis
    ?.slice(0, 4)
    .map(r => r.title);

  const difficultyReasons = auditData.failureModes
    ?.slice(0, 3)
    .map(f => f.step);

  const completionReasons = [
    `${auditData.estimatedTimeWeeks} week timeline`,
    `${auditData.readinessScore}% readiness`,
    `${auditData.riskScore}% project risk`,
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-5">

      {/* Risk */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <p className="text-sm text-slate-400">
          Risk Score
        </p>

        <h2 className="text-4xl font-bold text-rose-400 mt-2">
          {auditData.riskScore}%
        </h2>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-300 mb-2">
            Why?
          </p>

          <ul className="space-y-1">
            {riskReasons?.map((item, index) => (
              <li
                key={index}
                className="text-xs text-slate-400"
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Difficulty */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

        <p className="text-sm text-slate-400">
          Difficulty
        </p>

        <h2 className="text-4xl font-bold text-indigo-400 mt-2">
          {auditData.difficultyScore}/100
        </h2>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-300 mb-2">
            Why?
          </p>

          <ul className="space-y-1">
            {difficultyReasons?.map((item,index)=>(
              <li
                key={index}
                className="text-xs text-slate-400"
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Completion */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

        <p className="text-sm text-slate-400">
          Completion Probability
        </p>

        <h2 className="text-4xl font-bold text-emerald-400 mt-2">
          {auditData.completionProbability}%
        </h2>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-300 mb-2">
            Why?
          </p>

          <ul className="space-y-1">
            {completionReasons.map((item,index)=>(
              <li
                key={index}
                className="text-xs text-slate-400"
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}


// Module 3: Risk Analysis (High / Medium / Low with explanations)
function RiskAnalysis({ riskAnalysis }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4" /> Risk Analysis
      </h3>
      <div className="space-y-3">
        {riskAnalysis.map((r, i) => (
          <div key={i} className={`border rounded-xl p-3 ${LEVEL_STYLES[r.level] || LEVEL_STYLES.Medium}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-slate-100">{r.title}</span>
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full border border-current">{r.level}</span>
            </div>
            <p className="text-xs text-slate-300">{r.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Module 4: Failure Modes — cause-and-effect chain
function FailureModes({ failureModes, projectTitle }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-1">
        <Cpu className="w-4 h-4" /> Failure Modes — What Usually Goes Wrong
      </h3>
      <p className="text-[11px] text-slate-500 mb-4">Typical failure chain for a project like "{projectTitle}"</p>
      <div className="flex flex-col items-center">
        {failureModes.map((f, i) => (
          <React.Fragment key={i}>
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-slate-100">{f.step}</p>
              <p className="text-xs text-slate-400 mt-1">{f.description}</p>
            </div>
            {i < failureModes.length - 1 && (
              <ArrowDown className="w-4 h-4 text-slate-600 my-2 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Module 5: Missing Requirements — scored against the standard checklist
function RequirementsChecklist({ requirementsChecklist }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4" /> Missing Requirements
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {requirementsChecklist.map((r, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${
              r.status === 'missing'
                ? 'border-rose-900/40 bg-rose-950/20 text-rose-200'
                : 'border-emerald-900/40 bg-emerald-950/20 text-emerald-200'
            }`}
          >
            <span className="font-bold">{r.status === 'missing' ? '✗' : '✓'}</span>
            <div>
              <p className="font-semibold text-slate-100">{r.name}</p>
              <p className="text-slate-400 mt-0.5">{r.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Module 6: Mitigation Plan — specific recommendations per risk
function MitigationPlan({ mitigationPlan }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2 mb-4">
        <Wrench className="w-4 h-4" /> Mitigation Plan
      </h3>
      <div className="space-y-3">
        {mitigationPlan.map((m, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 sm:w-40 shrink-0">{m.risk}</span>
            <ArrowDown className="w-3 h-3 text-slate-600 sm:hidden" />
            <span className="hidden sm:inline text-slate-600">→</span>
            <span className="text-xs text-slate-300">{m.recommendation}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Common beginner mistakes strip
function BeginnerMistakes({ mistakes }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-400" /> Common Beginner Pitfalls
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
        {mistakes.map((m, i) => (
          <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800">⚠️ {m}</div>
        ))}
      </div>
    </div>
  );
}

export default function AuditReport({ auditData }) {
  return (
    <div className="space-y-6">
      <ScoreCards auditData={auditData} />
      <div className="grid md:grid-cols-2 gap-5">

  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

    <p className="text-sm text-slate-400">
      Final Readiness
    </p>

    <h2 className="text-4xl font-bold text-cyan-400">
      {auditData.readinessScore}%
    </h2>

    <p className="text-xs text-slate-400 mt-3">
      Based on your skill level, available hours and project complexity.
    </p>

  </div>

  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">

    <p className="text-sm text-slate-400">
      Estimated Timeline
    </p>

    <h2 className="text-4xl font-bold text-yellow-400">
      {auditData.estimatedTimeWeeks} Weeks
    </h2>

    <p className="text-xs text-slate-400 mt-3">
      AI estimated duration for successful completion.
    </p>

  </div>

</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskAnalysis riskAnalysis={auditData.riskAnalysis} />
        <FailureModes failureModes={auditData.failureModes} projectTitle={auditData.projectTitle} />
      </div>
      <RequirementsChecklist requirementsChecklist={auditData.requirementsChecklist} />
      <MitigationPlan mitigationPlan={auditData.mitigationPlan} />
      <BeginnerMistakes mistakes={auditData.commonBeginnerMistakes} />
    </div>
  );
}
