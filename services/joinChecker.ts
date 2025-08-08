import axios from "axios";

export const joinChannel = async (token: string, channelId: string) => {
  try {
    const response = await axios.post("https://slack.com/api/conversations.join", null, {
      params: {
        channel: channelId
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!response.data.ok) {
      throw new Error(`Failed to join channel: ${response.data.error}`);
    }

    console.log(`Successfully joined channel ${channelId}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error joining channel:", error.message);
    } else {
      console.error("Error joining channel:", error);
    }
  }
};

const getBotUserId = async (token: string): Promise<string> => {
  const response = await axios.get("https://slack.com/api/auth.test", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (response.data.ok) {
    return response.data.user_id;
  }
  throw new Error(response.data.error);
};


export const isBotInChannel = async (token: string, channelId: string) => {
  const response = await axios.get("https://slack.com/api/conversations.members", {
    params: { channel: channelId },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.data.ok) {
    const botUserId = await getBotUserId(token);
    return response.data.members.includes(botUserId);
  }

  throw new Error(response.data.error);
};
