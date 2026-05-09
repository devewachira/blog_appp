const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const blogPostRoutes = require("./routes/blogPostRoutes");
const commentRoutes = require("./routes/commentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const sequelize = require("./db/index");
const { User, BlogPost, Comment, ContactMessage } = require("./models");

// Trust proxy for production (Hostinger/Nginx)
app.set("trust proxy", 1);

// Middleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

console.log(`Running in ${process.env.NODE_ENV} mode`);

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", blogPostRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard-summary", dashboardRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/contact", contactRoutes);

app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV });
});

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../frontend/dist");
  console.log(`Serving frontend from: ${frontendPath}`);
  
  app.use(express.static(frontendPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running in Development Mode...");
  });
}

// Start Server
const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to MySQL successfully.");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Database synchronized");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("--- DATABASE CONNECTION ERROR ---");
    console.error("Error:", err.message);
    // Start anyway so the server doesn't crash completely
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB Connection Failed)`));
  });
