import axios from "axios";

export const getAccessToken = async (code: string) => {
  const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
    params: {
      code,
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      redirect_uri: process.env.SLACK_REDIRECT_URI
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data;
};

export const listChannels = async (token: string) => {
  const res = await axios.get("https://slack.com/api/conversations.list", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
  