function logger(req, res, next) {
  const { method, originalUrl } = req;
  res.on("finish", () => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${method} ${res.statusCode} ${originalUrl}`);
  });
  next();
}

module.exports = logger;
