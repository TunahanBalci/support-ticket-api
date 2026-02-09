
import { describe, expect, it, vi, beforeEach } from "vitest";
import { indexTicket, indexMessage } from "../../src/services/semantic.service";
import { semanticSearchQueue } from "../../src/config/queue";

vi.mock("../../src/config/queue", () => ({
  semanticSearchQueue: {
    add: vi.fn(),
  },
}));

describe("Semantic Service (Producer)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
  @description Adds a ticket indexing job to the queue
  @expected Job added to queue
  */
  it("should add ticket index job to queue", async () => {
    await indexTicket("ticket-123", "Title", "Description");

    expect(semanticSearchQueue.add).toHaveBeenCalledWith(
      "generate-embedding",
      {
        entityType: "ticket",
        entityId: "ticket-123",
        text: "Title: Title. Content: Description",
      }
    );
  });

  /**
  @description Adds a message indexing job to the queue
  @expected Job added to queue
  */
  it("should add message index job to queue", async () => {
    await indexMessage("msg-123", "Message Content");

    expect(semanticSearchQueue.add).toHaveBeenCalledWith(
      "generate-embedding",
      {
        entityType: "message",
        entityId: "msg-123",
        text: "Message Content",
      }
    );
  });
});
