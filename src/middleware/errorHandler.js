/**
 * Fallback middleware for unmatched routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Route not found.",
    method: req.method,
    path: req.originalUrl,
  });
}

/**
 * Centralized Express error handler.
 */
export function errorHandler(err, req, res, _next) {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON request body." });
  }

  const status = Number.isInteger(err?.status)
    ? err.status
    : Number.isInteger(err?.statusCode)
      ? err.statusCode
      : 500;

  const message = status >= 500 ? "Internal server error." : err.message || "Request failed.";

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({ error: message });
}
