const DEFAULT_SEED = [
  { id: 1, title: "Explore the REST API endpoints", completed: true },
  { id: 2, title: "Connect a database when ready", completed: false },
];

/**
 * Creates an in-memory item store for CRUD operations.
 */
export function createItemsStore(seedItems = DEFAULT_SEED) {
  const items = new Map();
  let nextId = 1;

  for (const item of seedItems) {
    const id = Number.isInteger(item.id) && item.id > 0 ? item.id : nextId;
    nextId = Math.max(nextId, id + 1);
    const now = new Date().toISOString();
    items.set(id, {
      id,
      title: String(item.title),
      completed: Boolean(item.completed),
      createdAt: item.createdAt ?? now,
      updatedAt: item.updatedAt ?? now,
    });
  }

  return {
    list({ q, completed } = {}) {
      let result = Array.from(items.values());

      if (typeof q === "string" && q.trim() !== "") {
        const query = q.trim().toLowerCase();
        result = result.filter((item) => item.title.toLowerCase().includes(query));
      }

      if (typeof completed === "boolean") {
        result = result.filter((item) => item.completed === completed);
      }

      return result;
    },

    getById(id) {
      return items.get(id) ?? null;
    },

    create({ title, completed = false }) {
      const now = new Date().toISOString();
      const item = {
        id: nextId++,
        title,
        completed,
        createdAt: now,
        updatedAt: now,
      };
      items.set(item.id, item);
      return item;
    },

    update(id, updates) {
      const existing = items.get(id);
      if (!existing) {
        return null;
      }

      const updated = {
        ...existing,
        ...updates,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      items.set(id, updated);
      return updated;
    },

    remove(id) {
      return items.delete(id);
    },
  };
}
