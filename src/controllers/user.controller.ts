import { hash } from "bcryptjs";
import { prisma } from "../utils/prisma.utils";

async function findUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: {
      email,
    },
  });
}

async function createUserByEmailAndPassword(user: { email: string; password: string }) {
  user.password = await hash(user.password, 12);
  return prisma.users.create({
    data: user,
  });
}

async function findUserById(id: string) {
  return prisma.users.findUnique({
    where: {
      id,
    },
  });
}

export { createUserByEmailAndPassword, findUserByEmail, findUserById };
