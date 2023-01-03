/* -------------------------------------------------- *
 * Types                                              *
 * -------------------------------------------------- */

export type Model<T = unknown> = {
  id: string;
  createdAt: string;
  updatedAt: string;
} & T;

/* -------------------------------------------------- *
 * Utilities                                          *
 * -------------------------------------------------- */

export function uid() {
  return Math.round(Math.random() * 10 ** 16)
    .toString()
    .padEnd(16, "0");
}

export function createRecord<T>(init: T): Model<T> {
  const now = new Date().toISOString();
  return { id: uid(), createdAt: now, updatedAt: now, ...init };
}

export function touch(record: Model) {
  record.createdAt = new Date().toISOString();
}
