/**
 * Specifies how the shape of the typed storage should be described. The keys
 * of the shape will be the keys that can be used for reading/writing values,
 * the values will be the type of the value that is needed for writing values,
 * and what's returned when reading values.
 */
type StorageShape = Record<string, unknown>;

/** Returns all string keys contained in the storage shape */
type StorageKey<T> = Extract<keyof T, string>;

/**
 * Extends the regular web storage to contain all the functionality you'd
 * expect, but also adds specific typings to functions directly operating
 * on values to ensure only the keys specified in the shape can be used,
 * and that the type of the values matches the one specified in the shape.
 */
export interface TypedStorage<S extends StorageShape> extends Storage {
  getItem<K extends StorageKey<S>, V = S[K]>(key: K): V | null;
  setItem<K extends StorageKey<S>, V = S[K]>(key: K, value: V): void;
  removeItem(key: StorageKey<S>): void;
}

/**
 * A simple, opinionated wrapper around a web storage compatible storage
 * that provides typed keys and automatically stringifies/parses values
 * that are written/read. You can provide a custom storage that implements
 * the web storage API (e.g. localStorage or sessionStorage). If no custom
 * storage is provided, it will default to localStorage.
 */
export function createStorage<S extends StorageShape>(
  provider: Storage = localStorage
): TypedStorage<S> {
  const storage: TypedStorage<S> = {
    clear() {
      return provider.clear();
    },

    get length() {
      return provider.length;
    },

    key(index) {
      return provider.key(index);
    },

    removeItem(key) {
      return provider.removeItem(key);
    },

    getItem(key) {
      const raw = provider.getItem(key);
      let parsed = null;

      if (raw)
        try {
          parsed = JSON.parse(raw);
        } catch {}

      return parsed;
    },

    setItem(key, value) {
      return provider.setItem(key, JSON.stringify(value));
    },
  };

  return storage;
}
