
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createTicket } from "../../src/controllers/ticket.controller";
import { prismaMock } from "../helpers/prisma-mock";
import { slackNotificationQueue } from "../../src/config/queue";

vi.mock("../../src/config/queue", () => ({
  slackNotificationQueue: {
    add: vi.fn(),
  },
}));

describe("Ticket Controller - Producer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
  @description Creates a ticket and adds a corresponding slack notification job to the queue
  @expected Ticket created and job added to queue
  */
  it("should add a job to the queue when ticket is created", async () => {
    const ticketData = {
      userId: "user-123",
      title: "New Issue",
      description: "Something is broken",
      status: "OPEN",
    };

    const createdTicket = {
      id: "ticket-unique-id",
      ...ticketData,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    prismaMock.tickets.create.mockResolvedValue(createdTicket as any);

    const result = await createTicket(ticketData.userId, ticketData.title, ticketData.description, ticketData.status);

    expect(result).toEqual(createdTicket);
    expect(prismaMock.tickets.create).toHaveBeenCalledTimes(1);
    
    expect(slackNotificationQueue.add).toHaveBeenCalledTimes(1);
    expect(slackNotificationQueue.add).toHaveBeenCalledWith(
      "send-slack-notification",
      expect.objectContaining({
        ticketId: "ticket-unique-id",
        title: "New Issue",
        description: "Something is broken",
      })
    );
  });
});
