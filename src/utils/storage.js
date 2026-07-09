const getStorage = () => {
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('[Storage] localStorage is unavailable', error);
    return null;
  }
};

export const getStoredValue = (key, fallback = null) => {
  try {
    const value = getStorage()?.getItem(key);
    return value === null || value === undefined ? fallback : value;
  } catch (error) {
    console.warn(`[Storage] Could not read "${key}"`, error);
    return fallback;
  }
};

export const getStoredJson = (key, fallback) => {
  const value = getStoredValue(key);
  if (value === null) return fallback;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`[Storage] Ignoring invalid JSON in "${key}"`, error);
    return fallback;
  }
};

export const setStoredValue = (key, value) => {
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(key, value);
    }
    return true;
  } catch (error) {
    console.warn(`[Storage] Could not write "${key}"`, error);
    return false;
  }
};

export const removeStoredValue = (key) => {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(key);
    }
    return true;
  } catch (error) {
    console.warn(`[Storage] Could not remove "${key}"`, error);
    return false;
  }
};

// One-time migration of legacy "blogcraft_*" localStorage keys (from before
// the rebrand) to the current "blogartifex_*" keys, so upgrading users keep
// their token, settings, templates and drafts.
//
// NOTE: this must only ever move keys whose prefix actually changes. A previous
// version rebuilt the source prefix to "blogartifex_" too, so newKey === oldKey
// and the setItem()/removeItem() pair deleted every blogartifex_* key on each
// load — logging users out and wiping their data. Guard against that.
const LEGACY_PREFIX = 'blogcraft_';
const CURRENT_PREFIX = 'blogartifex_';

const migrateStorage = () => {
  const storage = getStorage();
  if (!storage) return;

  const keysToMigrate = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(LEGACY_PREFIX)) {
      keysToMigrate.push(key);
    }
  }

  keysToMigrate.forEach(oldKey => {
    const newKey = CURRENT_PREFIX + oldKey.slice(LEGACY_PREFIX.length);
    if (newKey === oldKey) return; // never delete a key by "migrating" onto itself
    const value = storage.getItem(oldKey);
    if (value !== null && storage.getItem(newKey) === null) {
      storage.setItem(newKey, value);
    }
    storage.removeItem(oldKey);
  });
};

migrateStorage();
