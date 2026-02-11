
import { Queue } from "bullmq";
import type { RedisOptions } from "ioredis";
import { Redis } from "ioredis";

import { env } from '../utils/env.utils.js';

export const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
};

if (env.REDIS_PASSWORD) {
  redisOptions.password = env.REDIS_PASSWORD;
}

const connection = new Redis(redisOptions);


/** 
 * slackNotificationQueue
 * userEnrichmentQueue
 * semanticSearchQueue
 * 
 * @description Adds a job to the slack notification queue.
 * @returns {Promise<void>}
*/
export const slackNotificationQueue = new Queue("slack-notifications", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

export const userEnrichmentQueue = new Queue("user-enrichment", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export const semanticSearchQueue = new Queue("semantic-search", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
