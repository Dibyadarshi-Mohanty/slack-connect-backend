import type { Request, Response } from "express";
import { getAccessToken } from "../services/slackService";
import { encrypt } from "../utils/encrypt";
import { TokenModel } from "../models/token";
import { setSlackAccessToken } from "../tokenStore.js";

export const slackOAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
console.log("Slack OAuth callback received with code:", code);
  if (!code || typeof code !== "string") {
    return res.status(400).send("Missing code");
  }

  const data = await getAccessToken(code);
if (data.ok) {
    setSlackAccessToken(data.access_token); 
  }
  console.log("🔐 Slack OAuth token response:", data); 

  if (!data.ok) {
    console.error("❌ Slack OAuth failed:", data.error);
    return res.status(400).json(data);
  }

  const expiresIn = Number(data.expires_in);
  if (!expiresIn || isNaN(expiresIn) || expiresIn <= 0) {
    console.error("❌ Invalid expires_in from Slack:", data.expires_in);
    return res.status(400).send("Invalid token expiration data from Slack");
  }

  const expires_at = new Date(Date.now() + expiresIn * 1000);
  if (isNaN(expires_at.getTime())) {
    console.error("❌ Failed to create valid expires_at date from:", expiresIn);
    return res.status(400).send("Failed to calculate token expiration");
  }

  try {
   
    await TokenModel.findOneAndUpdate(
      { team_id: data.team.id },
      {
        access_token: encrypt(data.access_token),
        refresh_token: encrypt(data.refresh_token || ""),
        expires_at,
      },
      { upsert: true, new: true }
    );
    setSlackAccessToken(data.access_token);
    res.send(`
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Slack Connected</title>
      <meta http-equiv="refresh" content="3;url= http://localhost:5173" />
      <style>
        body { font-family: sans-serif; text-align: center; margin-top: 50px; }
      </style>
    </head>
    <body>
      <h2>✅ Slack connected successfully!</h2>
      <p>Redirecting you to the homepage...</p>
    </body>
  </html>
`);
  } catch (err) {
    console.error("❌ Failed to save token to DB:", err);
    res.status(500).send("Internal server error");
  }
};
