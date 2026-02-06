import { z } from "zod/v4";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_HOST: z.string(),
  APP_PORT: z.coerce.number(),
  DATABASE_URL: z.url(),
  AUTH_SECRET: z.string(),
  AUTH_ACCESS_TOKEN_EXPIRES_IN: z.string().default("1d"),
  AUTH_REFRESH_TOKEN_EXPIRES_IN: z.string().default("24h"),
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
  process.exit(1);
}

// eslint-disable-next-line node/no-process-env
export const env = envSchema.parse(process.env);
