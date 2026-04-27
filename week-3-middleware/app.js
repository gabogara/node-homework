const express = require("express");
const { randomUUID } = require("crypto");
const path = require("path");
const dogsRouter = require("./routes/dogs");
const { ValidationError, NotFoundError } = require("./errors");

const app = express();

app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]: ${req.method} ${req.path} (${req.requestId})`);
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use(express.json({ limit: "1mb" }));

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use((req, res, next) => {
  if (req.method === "POST") {
    const contentType = req.get("Content-Type");

    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({
        error: "Content-Type must be application/json",
        requestId: req.requestId,
      });
    }
  }

  next();
});

app.use("/", dogsRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 400 && statusCode < 500) {
    console.warn(`WARN: ${err.name} ${err.message}`);
    return res.status(statusCode).json({
      error: err.message,
      requestId: req.requestId,
    });
  }

  console.error(`ERROR: Error ${err.message}`);
  return res.status(500).json({
    error: "Internal Server Error",
    requestId: req.requestId,
  });
});

app.use((req, res) => {
  return res.status(404).json({
    error: "Route not found",
    requestId: req.requestId,
  });
});

const server = app.listen(3000, () =>
  console.log("Server listening on port 3000")
);
module.exports = server;
