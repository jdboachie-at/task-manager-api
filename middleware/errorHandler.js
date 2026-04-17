function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "internal server error"
      : err.message || "internal server error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
