import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";
import { generateTestToken } from "../helpers/auth-helper";
import { prismaMock } from "../helpers/prisma-mock";

describe("Ticket Routes", () => {
  const userPayload = { userId: "123e4567-e89b-12d3-a456-426614174000", role: "USER" };
  const userToken = generateTestToken(userPayload);

  const adminPayload = { userId: "987e6543-e21b-12d3-a456-426614174000", role: "SUPPORT_AGENT" };
  const adminToken = generateTestToken(adminPayload);

  describe("POST /api/v1/ticket/create", () => {
    /*
    @description Creates a new ticket successfully
    @expected 201 Created
    */
    it("should create a ticket successfully", async () => {
      const ticketData = {
        title: "Test Ticket",
        description: "This is a test ticket",
        status: "OPEN",
      };

      const createdTicket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        ...ticketData,
        userId: userPayload.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaMock.tickets.create.mockResolvedValue(createdTicket as any);

      const response = await request(app)
        .post("/api/v1/ticket/create")
        .set("Authorization", `Bearer ${userToken}`)
        .send(ticketData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("id", "123e4567-e89b-12d3-a456-426614174000");
      expect(response.body.message).toBe("Ticket created successfully");
    });

    /*
    @description Returns 400 if validation fails
    @expected 400 Bad Request
    */
    it("should return 400 if validation fails", async () => {
      const response = await request(app)
        .post("/api/v1/ticket/create")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "No desc" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/ticket/:id", () => {
    /*
    @description Returns ticket details if the user owns it
    @expected 200 OK
    */
    it("should return ticket if user owns it", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "My Ticket",
        userId: userPayload.userId,
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const response = await request(app)
        .get("/api/v1/ticket/123e4567-e89b-12d3-a456-426614174000")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", "123e4567-e89b-12d3-a456-426614174000");
    });

    /*
    @description Returns 403 if the user does not own the ticket and is not a support agent
    @expected 403 Forbidden
    */
    it("should return 403 if user does not own it (and not support agent)", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000-2",
        title: "Other User Ticket",
        userId: "other-user",
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const response = await request(app)
        .get("/api/v1/ticket/123e4567-e89b-12d3-a456-426614174000-2")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    /*
    @description Returns ticket details if a support agent requests it
    @expected 200 OK
    */
    it("should return ticket if support agent requests it", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000-2",
        title: "Other User Ticket",
        userId: "other-user",
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const response = await request(app)
        .get("/api/v1/ticket/123e4567-e89b-12d3-a456-426614174000-2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    /*
    @description Returns 404 if the ticket is soft deleted (as if it doesn't exist)
    @expected 404 Not Found
    */
    it("should return 404 if ticket is soft deleted", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Deleted Ticket",
        userId: userPayload.userId,
        deletedAt: new Date(),
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const response = await request(app)
        .get("/api/v1/ticket/123e4567-e89b-12d3-a456-426614174000")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    /*
    @description Returns 404 if the ticket is not found
    @expected 404 Not Found
    */
    it("should return 404 if ticket not found", async () => {
      prismaMock.tickets.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/ticket/non-existent")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/ticket/:id (Permission Bug Check)", () => {
    /*
    @description Verify that a user can access their own active ticket (Regression Test)
    @expected 200 OK
    */
    it("should allow user to access their own ACTIVE ticket", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "My Active Ticket",
        userId: userPayload.userId,
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      const response = await request(app)
        .get("/api/v1/ticket/123e4567-e89b-12d3-a456-426614174000")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe("PUT /api/v1/ticket/update", () => {
    /*
    @description Updates a ticket successfully
    @expected 200 OK
    */
    it("should update a ticket successfully", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: userPayload.userId,
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);
      prismaMock.tickets.update.mockResolvedValue({ ...ticket, title: "Updated" } as any);

      const response = await request(app)
        .put("/api/v1/ticket/update")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ id: "123e4567-e89b-12d3-a456-426614174000", title: "Updated" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Ticket updated successfully");
    });
  });

  describe("PUT /api/v1/ticket/delete", () => {
    /*
    @description Soft deletes a ticket
    @expected 200 OK
    */
    it("should soft delete a ticket", async () => {
      const ticket = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        userId: userPayload.userId,
        deletedAt: null,
      };

      prismaMock.tickets.findFirst.mockResolvedValue(ticket as any);

      prismaMock.tickets.update.mockResolvedValue({ ...ticket, deletedAt: new Date() } as any);

      const response = await request(app)
        .put("/api/v1/ticket/delete")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ id: "123e4567-e89b-12d3-a456-426614174000" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Ticket deleted successfully");
    });
  });

  describe("GET /api/v1/ticket/user/:userId", () => {
    /*
    @description Returns all tickets for a specific user
    @expected 200 OK
    */
    it("should return tickets for a user", async () => {
      const tickets = [
        { id: "123e4567-e89b-12d3-a456-426614174000", title: "Ticket 1", userId: userPayload.userId },
        { id: "123e4567-e89b-12d3-a456-426614174002", title: "Ticket 2", userId: userPayload.userId },
      ];

      prismaMock.tickets.findMany.mockResolvedValue(tickets as any);
      prismaMock.tickets.count.mockResolvedValue(2);

      const response = await request(app)
        .get(`/api/v1/ticket/user/${userPayload.userId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body).toHaveProperty("totalPages");
      expect(response.body).toHaveProperty("currentPage");
    });
  });

  describe("GET /api/v1/ticket/all", () => {
    /*
    @description Returns all tickets for a support agent
    @expected 200 OK
    */
    it("should return all messages/tickets for support agent", async () => {
      const tickets = [
        { id: "123e4567-e89b-12d3-a456-426614174000", title: "Ticket 1" },
      ];

      prismaMock.tickets.findMany.mockResolvedValue(tickets as any);
      prismaMock.tickets.count.mockResolvedValue(1);

      const response = await request(app)
        .get("/api/v1/ticket/all/")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    /*
    @description Returns 403 for a user role accessing all tickets
    @expected 403 Forbidden
    */
    it("should return 403 for user role", async () => {
      const response = await request(app)
        .get("/api/v1/ticket/all/")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
