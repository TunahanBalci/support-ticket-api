
import { describe, expect, it, vi, beforeEach } from "vitest";
import { enrichUserLocation } from "../../src/services/geo.service";
import { userEnrichmentQueue } from "../../src/config/queue";

vi.mock("../../src/config/queue", () => ({
  userEnrichmentQueue: {
    add: vi.fn(),
  },
}));

describe("Geo Service (Producer)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
  @description Adds a user enrichment job to the queue
  @expected Job added to queue
  */
  it("should add enrichment job to queue", async () => {
    await enrichUserLocation("user-123", "8.8.8.8");

    expect(userEnrichmentQueue.add).toHaveBeenCalledWith(
      "enrich-user-location",
      {
        userId: "user-123",
        ipAddress: "8.8.8.8",
      }
    );
  });
});
