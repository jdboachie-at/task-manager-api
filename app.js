require("dotenv").config();

const express = require("express");
const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(express.json());
app.use(logger);

app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number.parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => {
  console.log(`Task Manager API listening on http://localhost:${port}`);
});
