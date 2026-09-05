import { createClient } from "redis";

export let client;
async function redisConnection() {
  client = createClient({
    url: process.env.REDIS_URL,
  });

  await client.connect();

  console.log("Redis connected successfully");
}

export default redisConnection;
