import { createHash } from "node:crypto";

async function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export { hashToken };
