import { TokenModel } from "./models/token";
import { decrypt } from "./utils/encrypt";
import { setSlackAccessToken } from "./tokenStore";

export async function preloadSlackToken() {
  const record = await TokenModel.findOne();
  if (record?.access_token) {
    try {
      const token = decrypt(record.access_token);
      setSlackAccessToken(token);
      console.log("🔑 Slack token preloaded into memory");
    } catch (err) {
      console.error("❌ Failed to decrypt Slack token:", err);
    }
  } else {
    console.warn("⚠️ No token found in DB. Please authenticate first.");
  }
}
