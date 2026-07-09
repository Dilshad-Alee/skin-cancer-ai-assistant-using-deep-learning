/**
 * LocalStorage-backed prediction history.
 * Stores a lightweight record of each prediction (not the full image,
 * to avoid bloating localStorage — only a thumbnail data URL).
 */
const HISTORY_KEY = "skin_cancer_ai_history";
const MAX_HISTORY_ITEMS = 20;

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryItem(item) {
  try {
    const history = getHistory();
    const newItem = {
      id: item.request_id || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...item,
    };
    const updated = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getHistory();
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function removeHistoryItem(id) {
  try {
    const history = getHistory().filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch {
    return getHistory();
  }
}