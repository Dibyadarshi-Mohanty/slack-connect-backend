import { Request, Response } from "express";
import axios from "axios";
import { ScheduledMessageModel } from "../models/SchedulesMessage.js";
import { joinChannel } from "../services/joinChecker";
import { getSlackAccessToken } from '../tokenStore.js';

export const sendImmediateMessage = async (req: Request, res: Response) => {
  const { channel, text } = req.body;
  const token = getSlackAccessToken();
    console.log("🔑 Using Slack access token:", token);

  if (!token) throw new Error("Slack access token not set");
  // console.log("ENV SLACK_BOT_TOKEN:", process.env.SLACK_BOT_TOKEN);
console.log("ENV SLACK_BOT_TOKEN:", token)
  if (!token) {
    console.error("❌ SLACK_BOT_TOKEN is undefined");
    return res.status(500).json({
      success: false,
      error: "Slack bot token not configured",
      details: "Please check your .env file for SLACK_BOT_TOKEN"
    });
  }

  if (!channel || !text) {
    console.error("❌ Missing required fields:", { channel: !!channel, text: !!text });
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      details: "Both channel and text are required"
    });
  }

  try {
    console.log("🔄 Sending request to Slack API...");

    await joinChannel(token, channel);

    const response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channel.trim(),
        text: text.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("Slack API Response:", response.data);

    if (response.data.ok) {
      res.json({
        success: true,
        message: "Message sent to Slack!",
        data: response.data,
      });
    } else {
      console.error("Slack API error:", response.data);
      res.status(400).json({
        success: false,
        error: response.data.error,
        details: response.data,
      });
    }
  } catch (error: any) {
    console.error("Request error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    res.status(500).json({ 
      success: false, 
      error: "Server error",
      details: error.message,
      slackError: error.response?.data || null
    });
  }
};

export const getScheduledMessages = async (req: Request, res: Response) => {
  try {
    const msgs = await ScheduledMessageModel.find();
    res.json({ success: true, data: msgs });
  } catch (error: any) {
    console.error("DB Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

export const scheduleMessage = async (req: Request, res: Response) => {
  const { channel, text, send_at } = req.body;

  if (!channel || !text || !send_at) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      details: "channel, text, and send_at are required"
    });
  }

  try {
    const msg = await ScheduledMessageModel.create({
      channel,
      text,
      send_at,
      status: "pending"
    });
    res.json({ success: true, data: msg });
  } catch (error: any) {
    console.error("DB Save Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to schedule message" });
  }
};
