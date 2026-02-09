
import { describe, expect, it, vi, beforeEach } from "vitest";
import { slackJobProcessor } from "../../src/workers/slack.processor";
import type { SlackJobData } from "../../src/workers/slack.processor";
import { Job } from "bullmq";

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

vi.mock("../../src/utils/env.utils", () => ({
  env: {
    SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/test/webhook"
  }
}));

describe("Slack Job Processor", () => {
    
    beforeEach(() => {
        fetchMock.mockReset();
    });

    /**
    @description Sends a Slack notification successfully via the webhook
    @expected Notification sent successfully
    */
    it("should send a slack notification successfully", async () => {
        const jobData: SlackJobData = {
            ticketId: "ticket-123",
            title: "Test Ticket",
            description: "Test Description",
        };
        
        const mockJob = {
            id: "job-1",
            data: jobData,
            attemptsMade: 0,
        } as unknown as Job<SlackJobData>;

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ ok: true })
        });

        const result = await slackJobProcessor(mockJob);

        expect(result).toEqual({ success: true });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            "https://hooks.slack.com/services/test/webhook",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: expect.stringContaining("ticket-123")
            })
        );
    });

    /**
    @description Throws error when Slack API fails, triggering retry mechanism
    @expected Error thrown
    */
    it("should throw an error if slack api fails", async () => {
        const jobData: SlackJobData = {
            ticketId: "ticket-123",
            title: "Test Ticket",
            description: "Test Description",
        };
        
        const mockJob = {
            id: "job-1",
            data: jobData,
            attemptsMade: 0,
        } as unknown as Job<SlackJobData>;

        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => "Internal Server Error"
        });

        await expect(slackJobProcessor(mockJob)).rejects.toThrow("Slack API error: 500 - Internal Server Error");
    });
});
