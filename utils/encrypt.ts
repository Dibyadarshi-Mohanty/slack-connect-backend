import crypto from "crypto";

const algorithm = "aes-256-cbc";

// Derive a 32-byte key from the secret
const secret = process.env.ENCRYPTION_SECRET;
if (!secret) throw new Error("ENCRYPTION_SECRET is not set");

const key = crypto.createHash("sha256").update(secret).digest(); // 32 bytes

/**
 * Encrypts a string using AES-256-CBC and returns a base64-encoded string.
 */
export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16); // 16-byte IV
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);

  // Combine IV + encrypted data and encode as base64
  const combined = Buffer.concat([iv, encrypted]);
  return combined.toString("base64");
};

/**
 * Decrypts a base64-encoded string encrypted with AES-256-CBC.
 */
export const decrypt = (encryptedBase64: string): string => {
  try {
    const combined = Buffer.from(encryptedBase64, "base64");

    if (combined.length < 17) {
      throw new Error("Invalid encrypted text: too short");
    }

    const iv = combined.slice(0, 16); // Extract IV
    const encryptedText = combined.slice(16); // Extract encrypted content

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
