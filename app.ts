import type { Request, Response } from "express";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import {getPublicChannels} from "./Controllers/channelController.js";
import { slackOAuthCallback } from "./Controllers/authController.js";
import { sendImmediateMessage, scheduleMessage } from "./Controllers/messageController.js";
import { getScheduledMessages, cancelScheduledMessage } from "./Controllers/schedulerController.js";
import { startScheduler } from "./Controllers/scheduledDispatcher.js";
import { scheduleTokenCleanup } from "./services/tokenService.js";
dotenv.config();

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
scheduleTokenCleanup();
app.get("/slack/channels", getPublicChannels);
app.get("/slack/oauth/callback", slackOAuthCallback);
app.post("/slack/send", sendImmediateMessage);
app.post("/slack/schedule", scheduleMessage);
app.get("/slack/scheduled", getScheduledMessages);
app.delete("/slack/scheduled/:id", cancelScheduledMessage);


export default app;
