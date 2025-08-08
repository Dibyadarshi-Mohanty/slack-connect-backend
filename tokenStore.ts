export let slackAccessToken: string | null = null;

export function setSlackAccessToken(token: string) {
  slackAccessToken = token;
}

export function getSlackAccessToken(): string | null {
  return slackAccessToken;
}
