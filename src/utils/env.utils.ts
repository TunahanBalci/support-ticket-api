import { z } from "zod/v4";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_HOST: z.string(),
  APP_PORT: z.coerce.number(),
  DATABASE_URL: z.url(),
  AUTH_SECRET: z.string(),
  AUTH_ACCESS_TOKEN_EXPIRES_IN: z.string().default("1d"),
  AUTH_REFRESH_TOKEN_EXPIRES_IN: z.string().default("24h"),
  PAGINATION_LIMIT_MESSAGE_BY_TICKET: z.coerce.number().default(190),
  PAGINATION_LIMIT_MESSAGE_ALL: z.coerce.number().default(190),
  PAGINATION_LIMIT_TICKET_BY_USER: z.coerce.number().default(190),
  PAGINATION_LIMIT_TICKET_ALL: z.coerce.number().default(190),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().url(),
});

try {
  // eslint-disable-next-line node/no-process-env
  envSchema.parse(process.env);
}
catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Missing environment variables:", error.issues.flatMap(issue => issue.path));
  }
  else {
    console.error(error);
  }
  if (process.env.NODE_ENV === "test") {
    throw new Error(`Invalid environment variables: ${JSON.stringify((error as z.ZodError).issues)}`);
  }
  process.exit(1);
}

// eslint-disable-next-line node/no-process-env
export const env = envSchema.parse(process.env);
