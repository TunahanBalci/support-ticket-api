import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";
import { prisma } from "../setup-integration";
import { createTestUser } from "./utils";

describe("Ticket Integration Tests", () => {
  /*
  @description Runs full ticket lifecycle including soft delete
  @expected 201 Created then 200 OK then 404 Not Found
  */
  it("should perform full ticket lifecycle (Create, Read, Update, Delete)", async () => {
    const { token, userId } = await createTestUser("ticket_user@example.com");

    const createRes = await request(app)
      .post("/api/v1/ticket/create")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Integration Test Ticket",
        description: "Testing DB persistence",
      });

    if (createRes.status !== 201) {
      console.log("Create Ticket Failed:", createRes.status, JSON.stringify(createRes.body, null, 2));
    }
    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.data.id;
    console.log("Created Ticket ID:", ticketId);
    expect(ticketId).toBeDefined();

    const ticketInDb = await prisma.tickets.findUnique({ where: { id: ticketId } });
    expect(ticketInDb).toMatchObject({
      title: "Integration Test Ticket",
      userId,
      status: "OPEN",
    });

    const getRes = await request(app)
      .get(`/api/v1/ticket/${ticketId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(ticketId);

    const updateRes = await request(app)
      .put("/api/v1/ticket/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: ticketId,
        title: "Updated Title",
        description: "Updated Description",
        status: "PENDING",
      });

    expect(updateRes.status).toBe(200);

    const updatedTicket = await prisma.tickets.findUnique({ where: { id: ticketId } });
    expect(updatedTicket?.title).toBe("Updated Title");
    expect(updatedTicket?.status).toBe("PENDING");

    const deleteRes = await request(app)
      .put("/api/v1/ticket/delete")
      .set("Authorization", `Bearer ${token}`)
      .send({ id: ticketId });

    expect(deleteRes.status).toBe(200);

    const deletedTicket = await prisma.tickets.findUnique({ where: { id: ticketId } });
    expect(deletedTicket?.deletedAt).not.toBeNull();

    const accessRes = await request(app)
      .get(`/api/v1/ticket/${ticketId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(accessRes.status).toBe(404);
  });

  /*
  @description Prevents a user from accessing another user's ticket
  @expected 403 Forbidden
  */
  it("should prevent user from accessing other user's tickets", async () => {
    const user1 = await createTestUser("user1@example.com");
    const user2 = await createTestUser("user2@example.com");

    const createRes = await request(app)
      .post("/api/v1/ticket/create")
      .set("Authorization", `Bearer ${user1.token}`)
      .send({ title: "User 1 Ticket", description: "Secret" });

    if (createRes.status !== 201) {
      console.log("User 1 Create Ticket Failed:", createRes.status, JSON.stringify(createRes.body, null, 2));
    }
    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.data.id;

    const getRes = await request(app)
      .get(`/api/v1/ticket/${ticketId}`)
      .set("Authorization", `Bearer ${user2.token}`);

    expect(getRes.status).toBe(403);
  });

  /*
  @description Allows a support agent to access any ticket
  @expected 200 OK
  */
  it("should allow support agent to access all tickets", async () => {
    const user = await createTestUser("user_supp@example.com");
    const agent = await createTestUser("agent@example.com", "SUPPORT_AGENT");

    const createRes = await request(app)
      .post("/api/v1/ticket/create")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Help me", description: "Support needed" });
    const ticketId = createRes.body.data.id;

    // Agent accesses ticket
    const getRes = await request(app)
      .get(`/api/v1/ticket/${ticketId}`)
      .set("Authorization", `Bearer ${agent.token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(ticketId);
  });
});
