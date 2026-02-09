import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../src/app";
import { generateTestToken } from "../helpers/auth-helper";
import { prismaMock } from "../helpers/prisma-mock";

describe("Message Routes", () => {
  const userPayload = { userId: "user-123", role: "USER" };
  const userToken = generateTestToken(userPayload);
  const supportPayload = { userId: "support-123", role: "SUPPORT_AGENT" };
  const supportToken = generateTestToken(supportPayload);

  describe("POST /api/v1/message/create", () => {
    /*
    @description Creates a message linked to a ticket successfully
    @expected 201 Created
    */
    it("should create a message for a ticket", async () => {
      const messageData = {
        content: "Hello I need help",
        ticketId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: userPayload.userId,
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const createdMessage = {
        id: "msg-1",
        content: messageData.content,
        senderType: "USER",
        ticketId: messageData.ticketId,
        createdAt: new Date(),
      };

      prismaMock.messages.create.mockResolvedValue(createdMessage as any);

      const response = await request(app)
        .post("/api/v1/message/create")
        .set("Authorization", `Bearer ${userToken}`)
        .send(messageData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("id", "msg-1");
      expect(response.body.message).toBe("Message created successfully");
    });

    /*
    @description Returns 403 if a user tries to message on a ticket they don't own
    @expected 403 Forbidden
    */
    it("should return 403 if user tries to message on a ticket they don't own", async () => {
      const messageData = {
        content: "Hello",
        ticketId: "ticket-2",
      };

      const ticket = {
        id: "ticket-2",
        userId: "other-user",
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const response = await request(app)
        .post("/api/v1/message/create")
        .set("Authorization", `Bearer ${userToken}`)
        .send(messageData);

      expect(response.status).toBe(403);
    });

    /*
    @description Returns 404 if the ticket is not found when creating a message
    @expected 404 Not Found
    */
    it("should return 404 if ticket not found", async () => {
      prismaMock.tickets.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/message/create")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ content: "Hi", ticketId: "non-existent" });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/message/ticket/:ticketId", () => {
    /*
    @description Retrieves all messages for a specific ticket
    @expected 200 OK
    */
    it("should retrieve messages for a ticket", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: userPayload.userId,
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const messages = [
        { id: "msg-1", content: "Hi", senderType: "USER" },
        { id: "msg-2", content: "Hello", senderType: "SUPPORT_AGENT" },
      ];

      prismaMock.messages.findMany.mockResolvedValue(messages as any);
      prismaMock.messages.count.mockResolvedValue(2);

      const response = await request(app)
        .get("/api/v1/message/ticket/123e4567-e89b-12d3-a456-426614174000")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.messages).toHaveLength(2);
    });
  });

  describe("GET /api/v1/message/all", () => {
    /*
    @description Retrieves all messages for a support agent
    @expected 200 OK
    */
    it("should return all messages for support agent", async () => {
      const messages = [
        { id: "msg-1", content: "Hi" },
      ];

      prismaMock.messages.findMany.mockResolvedValue(messages as any);
      prismaMock.messages.count.mockResolvedValue(1);

      const response = await request(app)
        .get("/api/v1/message/all/")
        .set("Authorization", `Bearer ${supportToken}`);

      expect(response.status).toBe(200);
      // message.routes.ts returns { data: { messages: [], ... } }
      expect(response.body.data.messages).toHaveLength(1);
    });
  });
});
