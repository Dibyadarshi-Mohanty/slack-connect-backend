import express from "express";
import cors from "cors";
import app from "./app";
import connectDB from "./config/db";
import { preloadSlackToken } from "./preloadToken";
import { startScheduler } from "./Controllers/scheduledDispatcher";

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

(async () => {
  await connectDB();

  await preloadSlackToken();
  startScheduler();

  app.listen(5000, () => {
    console.log(`🚀 Server running on http://localhost:5000`);
  });
})();
