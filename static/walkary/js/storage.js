const SafeStorage = (() => {
  function isStorageAvailable() {
    try {
      const testKey = "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  const memoryStore = new Map();

  function getItem(key) {
    try {
      if (isStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  }

  function setItem(key, value) {
    try {
      if (isStorageAvailable()) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {}
    memoryStore.set(key, value);
  }

  function removeItem(key) {
    try {
      if (isStorageAvailable()) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {}
    memoryStore.delete(key);
  }

  function readJSON(key, fallback) {
    try {
      const raw = getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  return { getItem, setItem, removeItem, readJSON, writeJSON };
})();

// データ移行: walked_data の steps を distance_m に補完
document.addEventListener("DOMContentLoaded", () => {
  const data = SafeStorage.readJSON("walked_data", []);
  let changed = false;
  for (const entry of data) {
    if (entry && entry.steps != null && entry.distance_m == null) {
      entry.distance_m = entry.steps;
      changed = true;
    }
  }
  if (changed) {
    SafeStorage.writeJSON("walked_data", data);
  }
});


