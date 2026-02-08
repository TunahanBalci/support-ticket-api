import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app";
import { prisma } from "../setup-integration";
import { createTestUser } from "./utils";

describe("Message Integration Tests", () => {
  /*
  @description Creates messages for a ticket and retrieves them
  @expected 200 OK
  */
  it("should create and retrieve messages for a ticket", async () => {
    const user = await createTestUser("msg_user@example.com");
    const agent = await createTestUser("msg_agent@example.com", "SUPPORT_AGENT");

    const ticketRes = await request(app)
      .post("/api/ticket/create")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ title: "Message Test Ticket", description: "Testing messages" });
    const ticketId = ticketRes.body.data.id;

    // 2. User creates a message
    const msg1Res = await request(app)
      .post("/api/message/create")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        content: "Help me please",
        ticketId,
      });

    expect(msg1Res.status).toBe(201);
    expect(msg1Res.body.data.senderType).toBe("USER");

    const msg1InDb = await prisma.messages.findUnique({ where: { id: msg1Res.body.data.id } });
    expect(msg1InDb?.content).toBe("Help me please");

    const msg2Res = await request(app)
      .post("/api/message/create")
      .set("Authorization", `Bearer ${agent.token}`)
      .send({
        content: "I am here to help",
        ticketId,
      });

    expect(msg2Res.status).toBe(201);
    expect(msg2Res.body.data.senderType).toBe("SUPPORT_AGENT");

    const listRes = await request(app)
      .get(`/api/message/ticket/${ticketId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.messages).toHaveLength(2);
    const contents = listRes.body.data.messages.map((m: any) => m.content);
    expect(contents).toContain("Help me please");
    expect(contents).toContain("I am here to help");
  });

  /*
  @description Blocks unauthorized users from posting messages to a ticket
  @expected 403 Forbidden
  */
  it("should prevent unauthorized users from posting messages", async () => {
    const owner = await createTestUser("owner@example.com");
    const intruder = await createTestUser("intruder@example.com");

    const ticketRes = await request(app)
      .post("/api/ticket/create")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ title: "Private Ticket", description: "..." });
    const ticketId = ticketRes.body.data.id;

    const msgRes = await request(app)
      .post("/api/message/create")
      .set("Authorization", `Bearer ${intruder.token}`)
      .send({
        content: "I shouldn't be here",
        ticketId,
      });

    expect(msgRes.status).toBe(403);
  });
});
