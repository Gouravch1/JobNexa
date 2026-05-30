const STORAGE_KEY = 'savedJobs';

function readSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeSaved(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / storage errors
  }
}

export function getSavedJobs() {
  return readSaved();
}

export function isSaved(kind, id) {
  const keyKind = (kind || 'JOB').toUpperCase();
  return readSaved().some((item) => item.kind === keyKind && item.id === id);
}

export function saveJob(entry) {
  if (!entry || !entry.id) return;
  const kind = (entry.kind || 'JOB').toUpperCase();
  const list = readSaved();
  if (list.some((item) => item.kind === kind && item.id === entry.id)) {
    return;
  }
  const toStore = {
    id: entry.id,
    kind,
    title: entry.title || '',
    company: entry.company || '',
    location: entry.location || '',
    salary: entry.salary || '',
    badge: entry.badge || (entry.company || '').substring(0, 2).toUpperCase(),
    savedAt: new Date().toISOString(),
  };
  writeSaved([toStore, ...list]);
}

export function removeJob(kind, id) {
  const keyKind = (kind || 'JOB').toUpperCase();
  const list = readSaved().filter((item) => !(item.kind === keyKind && item.id === id));
  writeSaved(list);
}

