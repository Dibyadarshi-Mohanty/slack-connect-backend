import axios from 'axios';
import { getSlackAccessToken } from '../tokenStore.js';

export const fetchPublicChannels = async () => {
  try {
    const token = getSlackAccessToken();
    console.log("🔑 Using Slack access token:", token);
  if (!token) throw new Error("Slack access token not set");
//     if (!process.env.SLACK_BOT_TOKEN) {
//   throw new Error('Slack bot token not configured');
// }
    const response = await axios.get('https://slack.com/api/conversations.list', {
      // headers: {
        
      //   Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      //   'Content-Type': 'application/x-www-form-urlencoded',
      // },
      headers: { Authorization: `Bearer ${token}` },
      params: {
        types: 'public_channel',
        exclude_archived: true,
        limit: 1000,
      },
    });

    if (!response.data.ok) {
      throw new Error(`Error fetching channels: ${response.data.error}`);
    }

    return response.data.channels;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching channels: ${error.message}`);
    } else {
      throw new Error('Error fetching channels: Unknown error');
    }
  }
};
