const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  }),
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const clientBuildPath = path.join(__dirname, "..", "client", "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong." });
});

const start = async () => {
  let dbConnected = false;

  try {
    await connectDb();
    dbConnected = true;
  } catch (error) {
    console.error("Startup error:", error.message);
    console.error(
      "Continuing start-up without MongoDB. API routes will fail until MONGO_URI is configured and Atlas network access is allowed.",
    );
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!dbConnected) {
      console.warn(
        "MongoDB is not connected. Backend APIs are unavailable until the database connection issue is fixed.",
      );
    }
  });
};

start();
