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

const migrateStorage = () => {
  const storage = getStorage();
  if (!storage) return;
  
  const keysToMigrate = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith('blogartifex_')) {
      keysToMigrate.push(key);
    }
  }
  
  keysToMigrate.forEach(oldKey => {
    const newKey = oldKey.replace('blogartifex_', 'blogartifex_');
    const value = storage.getItem(oldKey);
    if (value !== null) {
      storage.setItem(newKey, value);
      storage.removeItem(oldKey);
    }
  });
};

migrateStorage();
