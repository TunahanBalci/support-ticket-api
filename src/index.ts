import app from "./app.js";
import { env } from "./utils/env.utils.js";

const server = app.listen(env.APP_PORT, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${env.APP_PORT}`);
  /* eslint-enable no-console */
});

server.on("error", (err: Error & { code?: string }) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${env.APP_PORT} is already in use. Please choose another port or stop the process using it.`);
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
