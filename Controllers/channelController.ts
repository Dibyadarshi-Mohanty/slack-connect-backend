import { Request, Response } from 'express';
import { fetchPublicChannels } from '../Routes/slack.js'; 

export const getPublicChannels = async (req: Request, res: Response) => {
  try {
    const channels = await fetchPublicChannels();
    res.status(200).json({ success: true, channels });
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch public channels' });
  }
};
