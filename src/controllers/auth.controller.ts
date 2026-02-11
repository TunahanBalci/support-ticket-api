import { hashToken } from '../utils/hash-token.utils.js';
import { prisma } from '../utils/prisma.utils.js';

/*
@param refreshToken: The refresh token to be added to the database
@param userId: The ID of the user to whom the refresh token belongs
@description Adds a new refresh token to the database, associated with the given user ID
The refresh token is hashed before being stored in the database for security reasons
The token is set to expire in 30 days by default
*/
async function addRefreshToken(refreshToken: string, userId: string) {
  return prisma.refreshTokens.create({
    data: {
      hashedToken: await hashToken(refreshToken),
      userId,
      expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      // 1000 milliseconds * 60 seconds * 60 minutes * 24 hours * 30 days
    },
  });
}

/*
@param token: The refresh token to be found in the database
@description Finds a refresh token in the database by its hashed value
The provided token is hashed before being compared to the stored hashed tokens in the database
Returns the refresh token record if found, or null if not found
*/
async function findRefreshToken(token: string) {
  return prisma.refreshTokens.findFirst({
    where: {
      hashedToken: await hashToken(token),
    },
  });
}

/*
@param id: The ID of the refresh token to be deleted
@description Soft deletes a refresh token by setting its revoked field to true
*/
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

/*
@param userId: The ID of the user whose refresh tokens are to be revoked
@description Revokes all refresh tokens associated with the given user ID by setting their revoked field to true
*/
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
