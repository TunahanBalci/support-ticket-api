
import "dotenv/config";
import { Worker } from "bullmq";
import { redisOptions } from "../config/queue";
import { slackJobProcessor } from "./slack.processor";
import { geoJobProcessor } from "./geo.processor";
import { semanticJobProcessor } from "./semantic.processor";

// Slack Notification Worker
const slackWorker = new Worker(
  "slack-notifications",
  slackJobProcessor,
  {
    connection: redisOptions,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  },
);

slackWorker.on("completed", (job) => {
  console.log(`[SlackWorker] Job ${job.id} has completed!`);
});

slackWorker.on("failed", (job, err) => {
  console.error(`[SlackWorker] Job ${job?.id} has failed with ${err.message}`);
});

console.log("🚀 Slack Worker started");

// User Enrichment Worker
const geoWorker = new Worker(
  "user-enrichment",
  geoJobProcessor,
  {
    connection: redisOptions,
    concurrency: 5,
  }
);

geoWorker.on("completed", (job) => {
  console.log(`[GeoWorker] Job ${job.id} has completed!`);
});

geoWorker.on("failed", (job, err) => {
  console.error(`[GeoWorker] Job ${job?.id} has failed with ${err.message}`);
});

console.log("🌍 Geo Worker started");

// Semantic Search Worker
const semanticWorker = new Worker(
  "semantic-search",
  semanticJobProcessor,
  {
    connection: redisOptions,
    concurrency: 2, // Low concurrency for heavy model inference
  }
);

semanticWorker.on("completed", (job) => {
  console.log(`[SemanticWorker] Job ${job.id} has completed!`);
});

semanticWorker.on("failed", (job, err) => {
  console.error(`[SemanticWorker] Job ${job?.id} has failed with ${err.message}`);
});

console.log("🧠 Semantic Worker started");
