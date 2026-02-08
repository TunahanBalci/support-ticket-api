import jwt from "jsonwebtoken";
import { env } from "../../src/utils/env.utils";

function generateTestToken(payload: object = { userId: "test-user-id", role: "USER" }) {
  return jwt.sign(payload, env.AUTH_SECRET as string, { expiresIn: "1h" });
}

export { generateTestToken };
