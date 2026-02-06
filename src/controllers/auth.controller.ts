import { hashToken } from "../utils/hash-token.utils";
import { prisma } from "../utils/prisma.utils";

// used when we create a refresh token.
// a refresh token is valid for 30 days
// that means that if a user is inactive for more than 30 days, he will be required to log in again
async function addRefreshToken(refreshToken: string, userId: string) {
  return prisma.refreshTokens.create({
    data: {
      hashedToken: await hashToken(refreshToken),
      userId,
      expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    },
  });
}

// used to check if the token sent by the client is in the database.
async function findRefreshToken(token: string) {
  return prisma.refreshTokens.findUnique({
    where: {
      hashedToken: await hashToken(token),
    },
  });
}

// soft delete tokens after usage.
async function deleteRefreshTokenById(id: string) {
  return prisma.refreshTokens.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

async function revokeTokens(userId: string) {
  return prisma.refreshTokens.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
}

export { addRefreshToken, deleteRefreshTokenById, findRefreshToken, revokeTokens };
