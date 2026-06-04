const path = require("path");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const apiRoutes = require("./routes");
const { dbReady } = require("./db");

const app = express();
const port = Number(process.env.PORT || 3000);
const publicPath = path.join(__dirname, "..", "public");

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "atelier-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.use("/api", apiRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((err, _req, res, _next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(422).json({ errors: { image: "Image must be 10MB or smaller." } });
  }
  return res.status(500).json({ error: "Unexpected server error." });
});

const server = app.listen(port, async () => {
  console.log(`ATELIER server running at http://localhost:${port}`);
  await dbReady;
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the existing process or set PORT to another value.`);
    process.exit(1);
  }
  console.error("Server startup error:", error?.message || error);
  process.exit(1);
});
