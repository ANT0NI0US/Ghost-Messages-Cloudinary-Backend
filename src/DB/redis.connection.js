import { createClient } from "redis";
import configService from "../../config/config.service.js";

export const client = createClient({
  url: configService.DB_REDIS_URI,
});

// without this listener any redis disconnect throws an unhandled 'error' event and kills the whole server
// with it the client logs the error and reconnects by itself
client.on("error", (error) => {
  console.error(`Redis error: ${error.message}`);
});

export async function connectRedis() {
  await client.connect();
  console.info(`Redis connection stablish successfully`);
}
