
import { userEnrichmentQueue } from "../config/queue";

/** 
 * @param userId - The ID of the user to enrich.
 * @param ipAddress - The IP address of the user.
 * Enriches the user's location based on their IP address using a background queue.
 */
export const enrichUserLocation = async (userId: string, ipAddress: string): Promise<void> => {
  try {
    await userEnrichmentQueue.add("enrich-user-location", {
      userId,
      ipAddress,
    });
    console.log(`[GeoService] Added enrichment job for user ${userId}`);
  } catch (error) {
    console.error(`[GeoBackgroundError] Failed to add enrichment job for user ${userId}:`, error);
  }
};
