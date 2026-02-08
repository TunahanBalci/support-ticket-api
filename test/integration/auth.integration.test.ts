import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app";
import { prisma } from "../setup-integration";

describe("Auth Integration Tests", () => {
  describe("POST /api/auth/register", () => {
    /*
    @description Registers a new user and persists the record
    @expected 201 Created
    */
    it("should register a new user and persist to DB", async () => {
      const newUser = {
        email: "integration@example.com",
        password: "Password123!",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");

      const userInDb = await prisma.users.findFirst({
        where: { email: newUser.email },
      });
      expect(userInDb).not.toBeNull();
      expect(userInDb?.email).toBe(newUser.email);
    });

    /*
    @description Rejects duplicate email registration
    @expected 400 Bad Request
    */
    it("should not allow duplicate email registration", async () => {
      const user = {
        email: "duplicate@example.com",
        password: "Password123!",
      };

      await request(app).post("/api/auth/register").send(user);

      const response = await request(app)
        .post("/api/auth/register")
        .send(user);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    /*
    @description Logs in a user and issues tokens
    @expected 200 OK
    */
    it("should login successfully with valid credentials", async () => {
      const user = {
        email: "login@example.com",
        password: "Password123!",
      };

      await request(app).post("/api/auth/register").send(user);

      const response = await request(app)
        .post("/api/auth/login")
        .send(user);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("accessToken");

      const tokenInDb = await prisma.refreshTokens.findFirst({
        where: { User: { email: user.email } },
      });
      expect(tokenInDb).not.toBeNull();
    });

    /*
    @description Rejects login with invalid credentials
    @expected 403 Forbidden
    */
    it("should fail with invalid credentials", async () => {
      const user = {
        email: "fail@example.com",
        password: "Password123!",
      };

      await request(app).post("/api/auth/register").send(user);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ ...user, password: "WrongPassword" });

      expect(response.status).toBe(403);
    });
  });
});
