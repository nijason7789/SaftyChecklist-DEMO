/**
 * Type-safe local storage utility functions
 */

/**
 * Set an item in localStorage with type safety
 * @param key The key to store the value under
 * @param value The value to store
 */
export function setItem<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
}

/**
 * Get an item from localStorage with type safety
 * @param key The key to retrieve the value for
 * @param defaultValue Optional default value to return if the key doesn't exist
 * @returns The stored value or the default value
 */
export function getItem<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return defaultValue;
  }
}

/**
 * Remove an item from localStorage
 * @param key The key to remove
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
}

/**
 * Clear all items from localStorage
 */
export function clear(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Check if a key exists in localStorage
 * @param key The key to check
 * @returns True if the key exists, false otherwise
 */
export function hasItem(key: string): boolean {
  return localStorage.getItem(key) !== null;
}
