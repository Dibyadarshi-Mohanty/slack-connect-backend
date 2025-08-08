import type { Request, Response } from "express";
import  { ScheduledMessageModel }  from "../models/SchedulesMessage";

export const getScheduledMessages = async (_req: Request, res: Response) => {
  const msgs = await ScheduledMessageModel.find();
  res.json(msgs);
};

export const cancelScheduledMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  await ScheduledMessageModel.findByIdAndUpdate(id, { status: "cancelled" });
  res.json({ message: "Cancelled" });
};
