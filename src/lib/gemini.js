// Generic Gemini API caller used by every AI-powered module in DevRisk AI.
// All calls request responseMimeType: "application/json" and expect the
// model to return ONLY a JSON object matching the schema described in the
// system instruction.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
// gemini-2.5-flash was cut off for new API keys ahead of its official
// shutdown date. gemini-3.6-flash is the current GA replacement.
const MODEL = "gemini-3.6-flash";

// Pull the actual answer text out of a generateContent response. Gemini 3.x
// models "think" by default and can return the reasoning as separate parts
// (marked thought: true) alongside the real answer, so we drop those and
// only keep the answer parts before parsing.
function extractResponseText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .filter((p) => p?.text && !p.thought)
    .map((p) => p.text)
    .join("");
}

// Even with responseMimeType: "application/json", models occasionally wrap
// the JSON in ```json fences or add stray text around it. Strip that and
// isolate the outermost {...} object before parsing.
function parseJsonResponse(rawText) {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned);
}

export async function callGemini(systemInstruction, userPrompt) {
  if (!API_KEY) {
    throw new Error(
      "Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in your .env file."
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemInstruction}\n\nUser Input:\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "low" },
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    let message = "Failed to reach Gemini API";
    try {
      const err = await response.json();
      message = err.error?.message || message;
    } catch {
      // ignore parse failure, use default message
    }
    throw new Error(message);
  }

  const data = await response.json();

  const finishReason = data?.candidates?.[0]?.finishReason;
  const rawText = extractResponseText(data);

  if (!rawText) {
    throw new Error("Gemini returned an empty response. Try again.");
  }

  try {
    return parseJsonResponse(rawText);
  } catch {
    if (finishReason === "MAX_TOKENS") {
      throw new Error(
        "Gemini's response was cut off before it finished (hit the output token limit). Try again — if it keeps happening, shorten the project description or compare fewer stacks."
      );
    }
    throw new Error("Gemini returned malformed JSON. Try again.");
  }
}
// ---------------------------------------------------------------------------
// Fixed reference lists used across modules (kept out of the AI response so
// the checklist items are always stable and predictable for the UI).
// ---------------------------------------------------------------------------

export const STANDARD_REQUIREMENTS = [
  "Authentication",
  "Logging",
  "Error Handling",
  "README",
  "Validation",
  "Pagination",
  "Security",
  "Deployment",
  "Environment Variables",
  "Backups",
  "Testing",
  "Responsive Design",
  "Accessibility",
];

export const TESTING_ITEMS = [
  "Unit Tests",
  "API Tests",
  "Validation",
  "Responsive Design",
  "Error Handling",
  "Edge Cases",
];

export const DEPLOYMENT_ITEMS = [
  "Environment Variables",
  "Build",
  "Production Database",
  "HTTPS",
  "CORS",
  "README",
  "Live URL",
];

// ---------------------------------------------------------------------------
// Module 1 + 2-10: full project audit
// ---------------------------------------------------------------------------

export function buildAuditPrompt(project) {
  const systemPrompt = `
You are a Senior Software Architect and Risk Auditor evaluating a university
student software project. Analyze the project details and return a STRICT
JSON object and nothing else (no markdown fences, no commentary).

Output JSON Schema (match exactly, all fields required):
{
  "difficultyScore": number (0-100),
  "completionProbability": number (0-100),
  "riskScore": number (0-100),
  "readinessScore": number (0-100, how ready the student is to start today given their skill level and daily hours),
  "estimatedTimeWeeks": number,
  "riskAnalysis": [
    { "level": "High" | "Medium" | "Low", "title": "string", "explanation": "string (2-3 sentences, specific to this project)" }
  ],
  "failureModes": [
    { "step": "string (short label e.g. Authentication)", "description": "string (what usually goes wrong here and why)" }
  ],
  "requirementsChecklist": [
    { "name": "string", "status": "present" | "missing", "note": "string (1 sentence, specific to this project)" }
  ],
  "mitigationPlan": [
    { "risk": "string (short label matching a risk above)", "recommendation": "string (specific, actionable, tied to a week number where possible)" }
  ],
  "technologyAdvisor": [
    { "tech": "string e.g. MERN, Laravel, Next.js, Firebase, Supabase, Node", "why": "string (why this fits or does not fit THIS project)" }
  ],
  "commonBeginnerMistakes": ["string"],
  "weeklyMilestones": [
    { "week": "Week 1", "title": "string", "tasks": ["string"] }
  ],
  "githubStructure": "string formatted folder tree, use plain text with indentation, no markdown fences"
}

Rules:
- "requirementsChecklist" MUST contain exactly these ${STANDARD_REQUIREMENTS.length} items, in this order, each marked present or missing based on the project description: ${STANDARD_REQUIREMENTS.join(", ")}.
- "riskAnalysis" should contain 4-7 risks spread across High/Medium/Low, not all the same level.
- "failureModes" should read like a cause-and-effect chain of 4-6 steps a project like this typically fails at, in a logical order.
- "weeklyMilestones" must have exactly ${project.timelineWeeks} entries, one per week, sized to the team's daily hours and skill level.
- Tailor every field to the specific project description, tech stack, deadline, skill level and daily hours provided. Do not give generic filler.
`;

  const userPrompt = `
Project Title: ${project.projectTitle}
Description: ${project.description}
Preferred Tech Stack: ${project.preferredStack}
Team Size: ${project.teamSize} member(s)
Skill Level: ${project.skillLevel}
Daily Hours Available: ${project.dailyHours} hour(s)/day
Deadline: ${project.deadline}
Target Timeline: ${project.timelineWeeks} weeks
`;

  return { systemPrompt, userPrompt };
}

// ---------------------------------------------------------------------------
// Module 8: Stack comparison (2-3 stacks)
// ---------------------------------------------------------------------------

export function buildComparePrompt(stacks) {
  const systemPrompt = `
You are an expert CTO and Systems Architect. Compare the given technology
stacks for a university student software project. Return STRICT JSON only.

Output JSON Schema:
{
  "stacks": [
    {
      "name": "string",
      "difficulty": "Low" | "Medium" | "High",
      "learningCurve": "string (short phrase)",
      "deployment": "string (short phrase on deployment ease)",
      "performance": "string (short phrase)",
      "maintainability": "string (short phrase)",
      "community": "string (short phrase on community/support size)",
      "hostingCost": "string (short phrase, e.g. Free tier available / $5-10 mo)",
      "time": "string (estimated time to build an MVP)",
      "pros": ["string"],
      "cons": ["string"]
    }
  ],
  "verdict": "string (2-3 sentences on which stack is best for quick university delivery and why)"
}

Return one object in "stacks" for each stack listed below, in the same order.
`;

  const userPrompt = `Compare the following stacks for a university student project: ${stacks
    .filter(Boolean)
    .map((s, i) => `Stack ${String.fromCharCode(65 + i)}: "${s}"`)
    .join(" VS ")}`;

  return { systemPrompt, userPrompt };
}
