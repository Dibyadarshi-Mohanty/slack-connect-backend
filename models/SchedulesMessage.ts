import mongoose from "mongoose";

const ScheduledMessageSchema = new mongoose.Schema({
  channel: { type: String, required: true },
  text: { type: String, required: true },
  send_at: { type: Number, required: true },
  status: { type: String, default: "pending" }
});

export const ScheduledMessageModel = mongoose.model("ScheduledMessage", ScheduledMessageSchema);
