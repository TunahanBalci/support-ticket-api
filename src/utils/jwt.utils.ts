import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../env";

// Usually I keep the token between 5 minutes - 15 minutes
async function generateAccessToken(user: { id: string }) {
  return jwt.sign({ userId: user.id }, env.AUTH_SECRET as string, {
    expiresIn: env.AUTH_ACCESS_TOKEN_EXPIRES_IN as any,
  });
}

// Generate a random string as refreshToken
async function generateRefreshToken() {
  const token = crypto.randomBytes(16).toString("base64url");
  return token;
}

async function generateTokens(user: { id: string }) {
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken();
  return { accessToken, refreshToken };
}

export { generateAccessToken, generateRefreshToken, generateTokens };
