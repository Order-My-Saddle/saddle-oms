import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        const statusCode = response.statusCode;

        // Record metrics
        this.metricsService.incrementHttpRequests(method, route, statusCode);
        this.metricsService.observeHttpDuration(method, route, duration);
      }),
    );
  }
}
