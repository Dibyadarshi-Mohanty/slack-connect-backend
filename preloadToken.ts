import { TokenModel } from "./models/token.js";
import { decrypt } from "./utils/encrypt.js";
import { setSlackAccessToken } from "./tokenStore.js";

export async function preloadSlackToken() {
  try {
    const record = await TokenModel.findOne();
    if (record?.access_token) {
      const token = decrypt(record.access_token);
      setSlackAccessToken(token);
      console.log("🔑 Slack token preloaded into memory");
    } else {
      console.warn("⚠️ No token found in DB, scheduler may not work until connected");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("⚠️ Decryption failed, possibly due to old token format or wrong ENCRYPTION_SECRET:", error.message);
    } else {
      console.error("⚠️ Decryption failed, possibly due to old token format or wrong ENCRYPTION_SECRET:", error);
    }
  }
}
