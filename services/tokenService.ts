import { TokenModel } from "../models/token";
import { encrypt, decrypt } from "../utils/encrypt.js";
import axios from "axios";

const DEFAULT_EXPIRES_IN = 3600; 

export const saveTokens = async (
  team_id: string,
  access_token: string,
  refresh_token: string,
  expires_in?: number
) => {

  if (!expires_in || typeof expires_in !== "number" || isNaN(expires_in) || expires_in <= 0) {
    console.warn("Invalid or missing expires_in:", expires_in, "- using default 3600s");
    expires_in = DEFAULT_EXPIRES_IN;
  }


  const expires_at = new Date(Date.now() + expires_in * 1000);

  if (isNaN(expires_at.getTime())) {
    console.error("Failed to create valid expires_at date, using fallback");
    const fallbackExpiresAt = new Date(Date.now() + DEFAULT_EXPIRES_IN * 1000);
    throw new Error(`Invalid date calculation: expires_in=${expires_in}, fallback=${fallbackExpiresAt}`);
  }

  await TokenModel.findOneAndUpdate(
    { team_id },
    {
      access_token: encrypt(access_token),
      refresh_token: encrypt(refresh_token),
      expires_at,
    },
    { upsert: true, new: true }
  );
};

export const getAccessToken = async (team_id: string): Promise<string> => {
  const tokenDoc = await TokenModel.findOne({ team_id });
  if (!tokenDoc) throw new Error("Slack not connected");
  else{
    console.log("Found token for team:", team_id);
  }

  const expiresAt = tokenDoc.expires_at instanceof Date
    ? tokenDoc.expires_at.getTime()
    : new Date(tokenDoc.expires_at).getTime();

  if (Date.now() > expiresAt) {
    console.log("Access token expired. Refreshing...");
    await refreshAccessToken(team_id);
    const updatedDoc = await TokenModel.findOne({ team_id });
    if (!updatedDoc) throw new Error("Token refresh failed");
    return decrypt(updatedDoc.access_token);
  }

  return decrypt(tokenDoc.access_token);
};

export const refreshAccessToken = async (team_id: string): Promise<void> => {
  const tokenDoc = await TokenModel.findOne({ team_id });
  if (!tokenDoc) throw new Error("No token found for refresh");

  const refreshToken = decrypt(tokenDoc.refresh_token);

  const response = await axios.post("https://slack.com/api/oauth.v2.access", null, {
    params: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = response.data;
  console.log("🔁 Refresh token response:", data);

  if (!data.ok) {
    console.error("Slack token refresh failed:", data.error);
    throw new Error("Failed to refresh access token: " + data.error);
  }

  const {
    access_token,
    refresh_token: newRefreshToken,
    expires_in,
  } = data;

  await saveTokens(team_id, access_token, newRefreshToken || refreshToken, expires_in);
  console.log("Access token refreshed successfully for team:", team_id);
};

export const cleanupExpiredTokens = async () => {
  const result = await TokenModel.deleteMany({ expires_at: { $lt: new Date() } });
  console.log(`Cleaned up ${result.deletedCount} expired tokens`);
  return result.deletedCount;
};


export const scheduleTokenCleanup = () => {
  setInterval(async () => {
    try {
      await cleanupExpiredTokens();
    } catch (error) {
      console.error("Error during token cleanup:", error);
    }
  }, 24 * 60 * 60 * 1000);
};
export const getLatestAccessToken = async () => {
  const tokenDoc = await TokenModel.findOne().sort({ createdAt: -1 });
  return tokenDoc?.access_token || null;
};