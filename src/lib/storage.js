// Module 15: Saved Projects
// Persists full audit snapshots to localStorage so users can revisit them.

const STORAGE_KEY = "projectpilot_ai_saved_projects_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function listSavedProjects() {
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveProject(snapshot) {
  const projects = readAll();
  const id = snapshot.id || `proj_${Date.now()}`;
  const record = { ...snapshot, id, savedAt: Date.now() };
  const existingIdx = projects.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    projects[existingIdx] = record;
  } else {
    projects.push(record);
  }
  writeAll(projects);
  return record;
}

export function deleteProject(id) {
  const projects = readAll().filter((p) => p.id !== id);
  writeAll(projects);
}

export function getProject(id) {
  return readAll().find((p) => p.id === id) || null;
}
