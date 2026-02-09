import bcrypt from "bcryptjs";
import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";
import { prismaMock } from "../helpers/prisma-mock";

describe("Auth Routes", () => {
  describe("POST /api/v1/auth/register", () => {
    /*
    @description Registers a new user successfully
    @expected 201 Created
    */
    it("should register a new user successfully", async () => {
      const newUser = {
        email: "test@example.com",
        password: "Password123",
      };

      prismaMock.users.findFirst.mockResolvedValue(null);

      const createdUser = {
        id: "user-id-123",
        email: newUser.email,
        password: "hashed-password",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.users.create.mockResolvedValue(createdUser as any);
      prismaMock.refreshTokens.create.mockResolvedValue({} as any);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.message).toBe("User registered successfully");
    });

    /*
    @description Returns 400 if the email already exists
    @expected 400 Bad Request
    */
    it("should return 400 if email already exists", async () => {
      const existingUser = {
        email: "existing@example.com",
        password: "Password123",
      };

      prismaMock.users.findFirst.mockResolvedValue({ id: "existing-id", email: existingUser.email } as any);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("stack");
    });

    /*
    @description Returns 400 for invalid input types
    @expected 400 Bad Request
    */
    it("should return 400 for invalid input", async () => {
      const invalidUser = {
        email: "not-an-email",
        password: "123",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidUser);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    /*
    @description Logs in a user successfully with valid credentials
    @expected 200 OK
    */
    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Password123",
      };

      const originalPassword = await bcrypt.hash(loginData.password, 10);

      const user = {
        id: "user-id-123",
        email: loginData.email,
        password: originalPassword,
        role: "USER",
      };

      prismaMock.users.findFirst.mockResolvedValue(user as any);
      prismaMock.refreshTokens.create.mockResolvedValue({} as any);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    /*
    @description Returns 403 for invalid password
    @expected 403 Forbidden
    */
    it("should return 403 for invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const user = {
        id: "user-id-123",
        email: loginData.email,
        password: await bcrypt.hash("correctpassword", 10),
        role: "USER",
      };

      prismaMock.users.findFirst.mockResolvedValue(user as any);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(response.status).toBe(403);
    });

    /*
    @description Returns 403 if the user is not found
    @expected 403 Forbidden
    */
    it("should return 403 if user not found", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "Password123",
      };

      prismaMock.users.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      expect(response.status).toBe(403);
    });
  });
});
