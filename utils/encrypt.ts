import crypto from "crypto";

const algorithm = "aes-256-cbc";

const secret = process.env.ENCRYPTION_SECRET;
if (!secret) throw new Error("ENCRYPTION_SECRET is not set");

const key = crypto.createHash("sha256").update(secret).digest(); // 32 bytes


export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16); // 16-byte IV
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);

  const combined = Buffer.concat([iv, encrypted]);
  return combined.toString("base64");
};

export const decrypt = (encryptedBase64: string): string => {
  try {
    const combined = Buffer.from(encryptedBase64, "base64");

    if (combined.length < 17) {
      throw new Error("Invalid encrypted text: too short");
    }

    const iv = combined.slice(0, 16); 
    const encryptedText = combined.slice(16); 

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final()
    ]);

    return decrypted.toString("utf8");
  } catch (err) {
    console.error("Decryption failed:", err);
    throw new Error("Failed to decrypt: invalid input or mismatched key/IV");
  }
};

