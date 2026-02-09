import request from "supertest";
import app from "../../src/app";
import { generateTokens } from "../../src/utils/jwt.utils";
import { prisma } from "../setup-integration";

export async function createTestUser(emailPrefix: string, role: "USER" | "SUPPORT_AGENT" = "USER") {
  // Ensures no domain duplication in emails
  const baseName = emailPrefix.split("@")[0];
  const email = `${baseName}_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
  const password = "Password123!";

  const res = await request(app).post("/api/v1/auth/register").send({ email, password });

  if (res.status !== 201) {
    throw new Error(`Failed to create test user: ${res.status} ${JSON.stringify(res.body)}`);
  }

  let userId = res.body.data.userId;
  let token = res.body.data.accessToken;

  // If user needs to be SUPPORT_AGENT, update in DB and refresh token
  if (role !== "USER") {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      throw new Error("User not found after registration");

    await prisma.users.update({ where: { id: user.id }, data: { role } });
    userId = user.id;

    const loginRes = await request(app).post("/api/v1/auth/login").send({ email, password });
    if (loginRes.status === 200) {
      token = loginRes.body.data.accessToken;
    }
  }
  else {
    if (!userId) {
      const user = await prisma.users.findUnique({ where: { email } });
      userId = user?.id;
    }
  }

  return { token, userId, email };
}
