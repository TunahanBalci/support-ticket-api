
import type { Job } from "bullmq";
import { env } from '../utils/env.utils.js';

const SLACK_WEBHOOK_URL = env.SLACK_WEBHOOK_URL;

export interface SlackJobData {
  ticketId: string;
  title: string;
  description: string;
}

export const slackJobProcessor = async (job: Job<SlackJobData>) => {
  console.log(`Processing job ${job.id} for ticket ${job.data.ticketId} (Attempt ${job.attemptsMade + 1})`);

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎫 New Ticket Created",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Ticket ID:*\n${job.data.ticketId}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Title:*\n${job.data.title}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Description:*\n${job.data.description}`,
        },
      },
    ],
  };

  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Slack API error: ${response.status} - ${errorText}`);
  }

  console.log(`Job ${job.id} completed successfully`);
  return { success: true };
};
