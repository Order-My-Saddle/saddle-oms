import { registerAs } from "@nestjs/config";

export default registerAs("redis", () => ({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DATABASE || "0", 10),

  // Connection Pool Settings
  maxConnections: parseInt(process.env.REDIS_MAX_CONNECTIONS || "10", 10),
  minConnections: parseInt(process.env.REDIS_MIN_CONNECTIONS || "2", 10),

  // Timeouts (milliseconds)
  connectionTimeout: parseInt(
    process.env.REDIS_CONNECTION_TIMEOUT || "5000",
    10,
  ),
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || "5000", 10),

  // Cluster Configuration
  clusterEnabled: process.env.REDIS_CLUSTER_ENABLED === "true",
  clusterNodes: process.env.REDIS_CLUSTER_NODES
    ? process.env.REDIS_CLUSTER_NODES.split(",").map((node) => {
        const [host, port] = node.trim().split(":");
        return { host, port: parseInt(port, 10) };
      })
    : [],

  // Cache Settings
  keyPrefix: process.env.REDIS_KEY_PREFIX || "oms_cache",
  ttl: parseInt(process.env.CACHE_TTL || "300000", 10), // 5 minutes default in milliseconds
  max: parseInt(process.env.CACHE_MAX_ITEMS || "10000", 10),

  // Retry Configuration
  retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || "3", 10),
  retryDelayOnFailure: parseInt(
    process.env.REDIS_RETRY_DELAY_ON_FAILURE || "100",
    10,
  ),
}));
