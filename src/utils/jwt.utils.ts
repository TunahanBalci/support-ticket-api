import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from './env.utils.js';

/**
 * generateAccessToken - Generates a JWT access token for a user with their ID and role, signed with a secret key and an expiration time.
 *
 * generateTokens - Generates both an access token and a refresh token for a user, returning them as an object.
 *
 * @param user: An object containing the user's ID and role
 * 
 * @description Generates a JWT access token for the user, containing their ID and role as the payload.
 * The token is signed with a secret key and has an expiration time defined in the environment variables
 */
async function generateAccessToken(user: { id: string; role: string }) {
  return jwt.sign({
    userId: user.id,
    role: user.role,
  }, env.AUTH_SECRET as string, {
    expiresIn: env.AUTH_ACCESS_TOKEN_EXPIRES_IN as any,
  });
}

/**
 * @description Generates a random string to be used as a refresh token
 */
async function generateRefreshToken() {
  const token = crypto.randomBytes(16).toString("base64url");
  return token;
}

/**
 * @param user: An object containing the user's ID and role
 * @return An object containing both the access token and refresh token
 * 
 * @description Generates both an access token and a refresh token for the user.
 * The access token is generated using the generateAccessToken function, 
 * and the refresh token is generated using the generateRefreshToken function.
 * 
 */
async function generateTokens(user: { id: string; role: string }) {
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken();
  return { accessToken, refreshToken };
}

export { generateAccessToken, generateRefreshToken, generateTokens };
