import crypto from "crypto";

const algorithm = "aes-256-cbc";

const key = crypto.createHash("sha256")
  .update(String(process.env.ENCRYPTION_SECRET || "default_secret"))
  .digest(); // 32 bytes

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16); // 16-byte IV
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encryptedBuffer = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);

  const combined = Buffer.concat([iv, encryptedBuffer]);
  return combined.toString("base64");
};


export const decrypt = (encryptedBase64: string): string => {
  const combined = Buffer.from(encryptedBase64, "base64");

  if (combined.length < 17) {
    throw new Error("Invalid encrypted text: too short");
  }

  const iv = combined.slice(0, 16); 
  const encryptedText = combined.slice(16); 

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decryptedBuffer = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final()
  ]);

  return decryptedBuffer.toString("utf8");
};
