import axios from "axios";
import { ScheduledMessageModel } from "../models/SchedulesMessage.js";
import { joinChannel } from "../services/joinChecker";
import { getSlackAccessToken } from '../tokenStore';

export const  startScheduler = () => {
  const token = getSlackAccessToken();
    // console.log("🔑 Using Slack access token:", token);
  // const token = process.env.SLACK_BOT_TOKEN;
   if (!token) throw new Error("Slack access token not set");

  console.log("⏳ Scheduler started, checking every 60 seconds...");

  setInterval(async () => {
    try {
      const now = new Date();
      const messages = await ScheduledMessageModel.find({
        status: "pending",
        send_at: { $lte: now },
      });

      if (!messages.length) return;

      console.log(`📬 Found ${messages.length} message(s) to send`);

      for (const msg of messages) {
        try {
          msg.status = "sending";
          await msg.save();

          await joinChannel(token, msg.channel);

          const response = await axios.post(
            "https://slack.com/api/chat.postMessage",
            {
              channel: msg.channel,
              text: msg.text,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.ok) {
            msg.status = "sent";
            msg.send_at = Date.now();
            await msg.save();
            console.log(`✅ Message sent to ${msg.channel}`);
          } else {
            msg.status = "failed";
            msg.errors = response.data.error;
            await msg.save();
            console.error(`❌ Slack API error: ${response.data.error}`);
          }
        } catch (err: any) {
          msg.status = "failed";
          msg.errors = err.message;
          await msg.save();
          console.error("❌ Failed to send message:", err.message);
        }
      }
    } catch (err: any) {
      console.error("❌ Scheduler error:", err.message);
    }
  }, 60 * 1000);
};
