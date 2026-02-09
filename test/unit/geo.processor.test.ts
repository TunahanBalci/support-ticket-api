
import { describe, expect, it, vi, beforeEach } from "vitest";
import { geoJobProcessor, type GeoJobData } from "../../src/workers/geo.processor";
import { prismaMock } from "../helpers/prisma-mock";
import { Job } from "bullmq";

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe("Geo Job Processor", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.clearAllMocks();
  });

  /**
  @description Enriches user location with country data from IP address
  @expected Country updated in database
  */
  it("should enrich user location successfully", async () => {
    const jobData: GeoJobData = {
      userId: "user-123",
      ipAddress: "8.8.8.8",
    };

    const mockJob = {
      data: jobData,
    } as unknown as Job<GeoJobData>;

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", country: "United States" }),
    });

    await geoJobProcessor(mockJob);

    expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("8.8.8.8"), 
        expect.any(Object)
    );
    expect(prismaMock.users.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { country: "United States" },
    });
  });

  /**
  @description Skips enrichment for private/local IP addresses
  @expected No database update associated with the user
  */
  it("should skip private IPs", async () => {
    const jobData: GeoJobData = {
      userId: "user-123",
      ipAddress: "192.168.1.1",
    };

    const mockJob = {
      data: jobData,
    } as unknown as Job<GeoJobData>;

    await geoJobProcessor(mockJob);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(prismaMock.users.update).not.toHaveBeenCalled();
  });

  /**
  @description Throws error when Geo API fails, triggering retry mechanism
  @expected Error thrown
  */
  it("should handle failed API requests (throw error for retry)", async () => {
    const jobData: GeoJobData = {
      userId: "user-123",
      ipAddress: "8.8.8.8",
    };

    const mockJob = {
      data: jobData,
    } as unknown as Job<GeoJobData>;

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(geoJobProcessor(mockJob)).rejects.toThrow("Geo API returned 500");
  });
});
