import express from "express";
import { createItemsStore } from "./store/itemsStore.js";
import { createItemsRouter } from "./routes/items.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

/**
 * Creates and configures the Express application without binding a port.
 */
export function createApp({ store = createItemsStore() } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "node-rest-api",
      version: "1.0.0",
      status: "ok",
      endpoints: [
        "GET /health",
        "GET /api/items",
        "GET /api/items/:id",
        "POST /api/items",
        "PUT /api/items/:id",
        "PATCH /api/items/:id",
        "DELETE /api/items/:id",
      ],
    });
  });

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/items", createItemsRouter(store));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
