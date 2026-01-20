import { registerAs } from "@nestjs/config";
import { IsBoolean, IsNumber, IsOptional } from "class-validator";
import validateConfig from "../utils/validate-config";
import { CacheConfig } from "./cache-config.type";

class EnvironmentVariablesValidator {
  @IsBoolean()
  @IsOptional()
  ENABLE_CACHE: boolean;

  @IsNumber()
  @IsOptional()
  CACHE_TTL: number;
}

export default registerAs<CacheConfig>("cache", () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    enabled: process.env.ENABLE_CACHE === "true",
    ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 300000, // 5 minutes default
  };
});
