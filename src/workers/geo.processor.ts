
import type { Job } from "bullmq";
import { prisma } from '../utils/prisma.utils.js';

export interface GeoJobData {
  userId: string;
  ipAddress: string;
}

export const geoJobProcessor = async (job: Job<GeoJobData>) => {
  const { userId, ipAddress } = job.data;
  console.log(`[GeoService] Processing enrichment for user ${userId} (IP: ${ipAddress})`);

  try {
    if (
      !ipAddress ||
      ipAddress === "127.0.0.1" ||
      ipAddress === "::1" ||
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.16.") ||
      ipAddress.includes("localhost")
    ) {
      console.log(`[GeoService] Skipping local/private IP: ${ipAddress}`);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    try {
      const response = await fetch(`http://ip-api.com/json/${ipAddress}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geo API returned ${response.status}`);
      }

      const data = await response.json() as { country?: string; status: string };

      if (data.status !== "success" || !data.country) {
        console.log(`[GeoService] Geo API unsuccessful or no country found for IP: ${ipAddress}`);
        return;
      }
      
      await prisma.users.update({
        where: { id: userId },
        data: { country: data.country },
      });

      console.log(`[GeoService] Enriched user ${userId} with country: ${data.country}`);
    } catch (networkError) {
        clearTimeout(timeoutId);
        throw networkError;
    }

  } catch (error) {
    console.error(`[GeoJobError] User ${userId}:`, error);
    // Throwing error allows BullMQ to retry based on our queue config
    throw error;
  }
};
