import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";

/**
 * Telemetry secrets: shown to the customer once, stored AES-256-GCM
 * encrypted under TELEMETRY_SECRET_KEY (32-byte hex env var), never logged.
 * The server needs the plaintext back to verify per-request HMACs, which is
 * why these are encrypted rather than hashed.
 */

function key(): Buffer {
  const hex = process.env.TELEMETRY_SECRET_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("TELEMETRY_SECRET_KEY must be 32 bytes hex");
  }
  return Buffer.from(hex, "hex");
}

export function generateTelemetrySecret(): string {
  return `gmts_${randomBytes(24).toString("base64url")}`;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${iv.toString("base64")}.${cipher.getAuthTag().toString("base64")}.${enc.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  const [iv, tag, data] = stored.split(".");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/** Constant-time HMAC-SHA256 verification over the raw request body. */
export function verifyHmac(
  rawBody: string,
  signatureHex: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signatureHex, "hex");
  } catch {
    return false;
  }
  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
}
