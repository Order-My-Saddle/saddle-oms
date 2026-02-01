export class QuerySaddleStockDto {
  type?: "my" | "available" | "all";
  page?: number;
  limit?: number;
  search?: string;
}
