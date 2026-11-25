import { Router } from "express";

function parseId(rawId) {
  if (!/^\d+$/.test(rawId)) {
    return null;
  }
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validateTitle(title) {
  if (typeof title !== "string" || title.trim() === "") {
    return { error: "Field 'title' must be a non-empty string." };
  }
  return { value: title.trim() };
}

function validateCompleted(completed) {
  if (typeof completed !== "boolean") {
    return { error: "Field 'completed' must be a boolean." };
  }
  return { value: completed };
}

/**
 * Creates an Express router for /api/items CRUD endpoints.
 */
export function createItemsRouter(store) {
  const router = Router();

  router.get("/", (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    let completed;

    if (req.query.completed !== undefined) {
      if (req.query.completed === "true") {
        completed = true;
      } else if (req.query.completed === "false") {
        completed = false;
      } else {
        return res.status(400).json({ error: "Query parameter 'completed' must be 'true' or 'false'." });
      }
    }

    const data = store.list({ q, completed });
    return res.json({ data, count: data.length });
  });

  router.get("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const item = store.getById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res.json({ data: item });
  });

  router.post("/", (req, res) => {
    const body = req.body ?? {};
    const titleCheck = validateTitle(body.title);
    if (titleCheck.error) {
      return res.status(400).json({ error: titleCheck.error });
    }

    let completed = false;
    if (body.completed !== undefined) {
      const completedCheck = validateCompleted(body.completed);
      if (completedCheck.error) {
        return res.status(400).json({ error: completedCheck.error });
      }
      completed = completedCheck.value;
    }

    const created = store.create({ title: titleCheck.value, completed });
    return res.status(201).json({ data: created });
  });

  router.put("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const body = req.body ?? {};
    const titleCheck = validateTitle(body.title);
    if (titleCheck.error) {
      return res.status(400).json({ error: titleCheck.error });
    }

    let completed = false;
    if (body.completed !== undefined) {
      const completedCheck = validateCompleted(body.completed);
      if (completedCheck.error) {
        return res.status(400).json({ error: completedCheck.error });
      }
      completed = completedCheck.value;
    }

    const updated = store.update(id, { title: titleCheck.value, completed });
    if (!updated) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res.json({ data: updated });
  });

  router.patch("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const body = req.body ?? {};
    const updates = {};

    if (body.title !== undefined) {
      const titleCheck = validateTitle(body.title);
      if (titleCheck.error) {
        return res.status(400).json({ error: titleCheck.error });
      }
      updates.title = titleCheck.value;
    }

    if (body.completed !== undefined) {
      const completedCheck = validateCompleted(body.completed);
      if (completedCheck.error) {
        return res.status(400).json({ error: completedCheck.error });
      }
      updates.completed = completedCheck.value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Provide at least one field to update ('title' or 'completed')." });
    }

    const updated = store.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res.json({ data: updated });
  });

  router.delete("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const deleted = store.remove(id);
    if (!deleted) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res.status(204).send();
  });

  return router;
}
