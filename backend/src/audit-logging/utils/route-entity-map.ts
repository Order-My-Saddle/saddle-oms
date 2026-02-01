export const ROUTE_ENTITY_MAP: Record<string, string> = {
  orders: "Order",
  customers: "Customer",
  fitters: "Fitter",
  factories: "Factory",
  users: "User",
  extras: "Extra",
  presets: "Preset",
  brands: "Brand",
  saddles: "Saddle",
  warehouses: "Warehouse",
  comments: "Comment",
  "enriched-orders": "EnrichedOrder",
  "saddle-stock": "SaddleStock",
  "order-lines": "OrderLine",
  options: "Option",
  "options-items": "OptionItem",
  leathertypes: "Leathertype",
};

export function inferEntityFromRoute(url: string): string | undefined {
  // Extract the first path segment after /api/v1/
  const match = url.match(/\/api\/v\d+\/([^/?]+)/);
  if (!match) return undefined;
  return ROUTE_ENTITY_MAP[match[1]];
}
