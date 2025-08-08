import { TokenModel } from './models/token';
import { decrypt } from './utils/encrypt';
import { setSlackAccessToken } from './tokenStore';

export async function preloadSlackToken() {
  const record = await TokenModel.findOne(); 
  if (record?.access_token) {
    const token = decrypt(record.access_token);
    setSlackAccessToken(token);
    console.log("🔑 Slack token preloaded into memory");
  } else {
    console.warn("⚠️ No token found in DB, scheduler may not work until connected");
  }
}
