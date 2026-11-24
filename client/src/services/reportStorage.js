const REPORTS_KEY = 'vsl_reports_v1';

export function listReports() {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getReportById(id) {
  return listReports().find((r) => r.id === id) || null;
}

export function saveReport(reportInput) {
  const existing = listReports();
  const report = {
    id: `rep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...reportInput,
  };
  const next = [report, ...existing].slice(0, 40);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return report;
}

export function updateReportConclusion(id, conclusion) {
  const existing = listReports();
  let updated = null;
  const next = existing.map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, conclusion, updatedAt: new Date().toISOString() };
    return updated;
  });
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return updated;
}

export function deleteReport(id) {
  const next = listReports().filter((item) => item.id !== id);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}
