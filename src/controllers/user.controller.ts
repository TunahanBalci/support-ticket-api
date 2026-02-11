import { hash } from "bcryptjs";
import { prisma } from '../utils/prisma.utils.js';

/**
 * @param email: User's email
 * @description Finds a user by their email
 */
async function findUserByEmail(email: string) {
  return prisma.users.findFirst({
    where: {
      email,
    },
  });
}

/**
 * @param user: Object containing user's email and password
 * @description Creates a new user with the given email and password.
 * The password is hashed before being stored in the database
 */
async function createUserByEmailAndPassword(user: { email: string; password: string }) {
  user.password = await hash(user.password, 12);
  return prisma.users.create({
    data: user,
  });
}

/**
 * @param id: User's id
 * @description Finds a user by their id
*/
async function findUserById(id: string) {
  return prisma.users.findFirst({
    where: {
      id,
    },
  });
}

export { createUserByEmailAndPassword, findUserByEmail, findUserById };
