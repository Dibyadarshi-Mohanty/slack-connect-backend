let slackAccessToken: string | null = null;

export const setSlackAccessToken = (token: string) => {
  slackAccessToken = token;
};

export const getSlackAccessToken = () => slackAccessToken;
