import { Module } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";
import { MonitoringInterceptor } from "./monitoring.interceptor";

@Module({
  providers: [MetricsService, MonitoringInterceptor],
  controllers: [MetricsController],
  exports: [MetricsService, MonitoringInterceptor],
})
export class MonitoringModule {}
