export type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  database: number;
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  commandTimeout: number;
  clusterEnabled: boolean;
  clusterNodes: Array<{ host: string; port: number }>;
  keyPrefix: string;
  ttl: number;
  max: number;
  retryAttempts: number;
  retryDelayOnFailure: number;
};
