import express from "express";
import cors from "cors";

const app = express();

// FIX: Allow both your frontend domains
const allowedOrigins = [
  "https://logguardai.vercel.app",
  "https://logguard-ai-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for demo - change to false in prod
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// IMPORTANT: Handle preflight for all routes
app.options("*", cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ... your routes
import logRoutes from "./routes/logs.js";
import analyticsRoutes from "./routes/analytics.js";
import uploadRoutes from "./routes/upload.js";
import aiAnalysisRoutes from "./routes/aiAnalysis.js";

app.use("/api/logs", logRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiAnalysisRoutes);
app.use("/api/notifications", (await import("./routes/notification.js")).default || (await import("./routes/notifications.js")).default);

app.get("/", (req, res) => res.json({ status: "LogGuard MERN API Running", cors: "enabled" }));

export default app;