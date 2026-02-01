import { Page, expect, Request } from '@playwright/test';

export interface ApiValidation {
  status?: number;
  contentType?: string;
  hasHydraMembers?: boolean;
  hasPagination?: boolean;
  minItems?: number;
  maxItems?: number;
}

export interface EntityTestConfig {
  endpoint: string;
  entityName: string;
  expectedFields: string[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
}

// Entity configurations for validation (updated for NestJS backend)
export const ENTITY_CONFIGS: Record<string, EntityTestConfig> = {
  orders: {
    endpoint: '/api/v1/orders',
    entityName: 'Order',
    expectedFields: ['id', 'fitterId', 'customerId', 'factoryId', 'orderStatus'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: true
  },
  enrichedOrders: {
    endpoint: '/api/v1/enriched_orders',
    entityName: 'EnrichedOrder',
    expectedFields: ['id'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: true
  },
  customers: {
    endpoint: '/api/v1/customers',
    entityName: 'Customer',
    expectedFields: ['id', 'name', 'email'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: false
  },
  fitters: {
    endpoint: '/api/v1/fitters',
    entityName: 'Fitter',
    expectedFields: ['id', 'userId'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: false
  },
  factories: {
    endpoint: '/api/v1/factories',
    entityName: 'Factory',
    expectedFields: ['id', 'userId'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: false
  },
  saddles: {
    endpoint: '/api/v1/saddles',
    entityName: 'Saddle',
    expectedFields: ['id', 'brand', 'modelName', 'sequence'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: true
  },
  users: {
    endpoint: '/api/v1/users',
    entityName: 'User',
    expectedFields: ['id', 'username', 'email'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: true
  },
  brands: {
    endpoint: '/api/v1/brands',
    entityName: 'Brand',
    expectedFields: ['id', 'brandName'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: true
  },
  options: {
    endpoint: '/api/v1/options',
    entityName: 'Option',
    expectedFields: ['id', 'name', 'sequence'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: true
  },
  warehouses: {
    endpoint: '/api/v1/warehouses',
    entityName: 'Warehouse',
    expectedFields: ['id', 'name'],
    searchable: true,
    filterable: true,
    sortable: true,
    pagination: true
  },
  extras: {
    endpoint: '/api/v1/extras',
    entityName: 'Extra',
    expectedFields: ['id', 'name'],
    searchable: true,
    filterable: false,
    sortable: false,
    pagination: true
  },
  presets: {
    endpoint: '/api/v1/presets',
    entityName: 'Preset',
    expectedFields: ['id'],
    searchable: true,
    filterable: false,
    sortable: false,
    pagination: true
  },
  leathertypes: {
    endpoint: '/api/v1/leathertypes',
    entityName: 'Leathertype',
    expectedFields: ['id'],
    searchable: true,
    filterable: false,
    sortable: false,
    pagination: true
  },
  saddleStock: {
    endpoint: '/api/v1/saddle-stock',
    entityName: 'SaddleStock',
    expectedFields: ['id', 'serial', 'name'],
    searchable: true,
    filterable: true,
    sortable: false,
    pagination: true
  }
};

export class ApiHelper {
  private requests: Request[] = [];
  private apiUrl = 'http://localhost:3001/api';

  constructor(private page: Page) {
    // Track API requests
    this.page.on('request', request => {
      if (request.url().includes(this.apiUrl)) {
        this.requests.push(request);
      }
    });
  }

  async validateApiResponse(response: any, validation: ApiValidation): Promise<void> {
    if (validation.status) {
      expect(response.status).toBe(validation.status);
    }

    const data = await response.json();

    if (validation.hasHydraMembers) {
      expect(data).toHaveProperty('hydra:member');
      expect(Array.isArray(data['hydra:member'])).toBe(true);
    }

    if (validation.hasPagination) {
      expect(data).toHaveProperty('hydra:totalItems');
      expect(data).toHaveProperty('hydra:view');
    }

    if (validation.minItems !== undefined && data['hydra:member']) {
      expect(data['hydra:member'].length).toBeGreaterThanOrEqual(validation.minItems);
    }

    if (validation.maxItems !== undefined && data['hydra:member']) {
      expect(data['hydra:member'].length).toBeLessThanOrEqual(validation.maxItems);
    }
  }

  async validateEntityResponse(entityType: string, response: any): Promise<void> {
    const config = ENTITY_CONFIGS[entityType];
    if (!config) {
      throw new Error(`No configuration found for entity type: ${entityType}`);
    }

    const data = await response.json();
    let entities: any[] = [];

    // Handle different response formats:
    // 1. Hydra format (enriched orders, saddle-stock): { "hydra:member": [...], "hydra:totalItems": N }
    // 2. Paginated format (orders, saddles): { data: [...], total: N, pages: N }
    // 3. Infinity pagination (users): { data: [...], meta: { hasNextPage, ... } }
    // 4. Direct array format (customers, fitters, factories): [...]

    if (data['hydra:member'] !== undefined) {
      expect(data).toHaveProperty('hydra:member');
      expect(Array.isArray(data['hydra:member'])).toBe(true);
      entities = data['hydra:member'];

      if (config.pagination) {
        expect(data).toHaveProperty('hydra:totalItems');
        expect(typeof data['hydra:totalItems']).toBe('number');
      }
    } else if (data.data !== undefined) {
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      entities = data.data;

      if (config.pagination) {
        // Could be standard pagination or infinity pagination
        if (data.meta !== undefined) {
          expect(data).toHaveProperty('meta');
        } else {
          expect(data).toHaveProperty('total');
          expect(typeof data.total).toBe('number');
        }
      }
    } else if (Array.isArray(data)) {
      entities = data;
    } else {
      throw new Error(`Unexpected response format for ${entityType}: ${JSON.stringify(data).slice(0, 200)}`);
    }

    // Validate entity structure if we have data
    if (entities.length > 0) {
      const firstEntity = entities[0];

      // Check required fields
      for (const field of config.expectedFields) {
        expect(firstEntity).toHaveProperty(field);
      }
    }
  }

  getLastApiRequest(endpoint?: string): Request | undefined {
    if (endpoint) {
      return this.requests
        .filter(req => req.url().includes(endpoint))
        .slice(-1)[0];
    }
    return this.requests.slice(-1)[0];
  }

  getApiRequests(endpoint?: string): Request[] {
    if (endpoint) {
      return this.requests.filter(req => req.url().includes(endpoint));
    }
    return this.requests;
  }

  clearRequestHistory(): void {
    this.requests = [];
  }

  async interceptNextApiCall(endpoint: string): Promise<Request> {
    return new Promise((resolve) => {
      const handler = (request: Request) => {
        if (request.url().includes(endpoint)) {
          this.page.off('request', handler);
          resolve(request);
        }
      };
      this.page.on('request', handler);
    });
  }

  validateODataParams(url: string, expectedParams: Record<string, any>): void {
    const urlObj = new URL(url);

    for (const [param, expectedValue] of Object.entries(expectedParams)) {
      const actualValue = urlObj.searchParams.get(param);

      if (expectedValue === null) {
        expect(actualValue).toBeNull();
      } else {
        expect(actualValue).toBe(String(expectedValue));
      }
    }
  }

  validateSearchParam(url: string, searchTerm: string): void {
    const urlObj = new URL(url);
    const searchParam = urlObj.searchParams.get('search') || urlObj.searchParams.get('searchTerm');
    expect(searchParam).toBe(searchTerm);
  }

  validateFilterParam(url: string, filterKey: string, filterValue: string): void {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // Check for direct parameter
    if (params.has(filterKey)) {
      expect(params.get(filterKey)).toBe(filterValue);
      return;
    }

    // Check for OData $filter parameter
    const filter = params.get('$filter');
    if (filter) {
      expect(filter).toContain(filterKey);
      expect(filter).toContain(filterValue);
    }
  }

  validateSortParam(url: string, sortField: string, sortOrder: 'asc' | 'desc' = 'desc'): void {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // Check for order parameter (API Platform style)
    const orderParam = params.get(`order[${sortField}]`);
    if (orderParam) {
      expect(orderParam).toBe(sortOrder);
      return;
    }

    // Check for orderBy/orderDirection parameters
    const orderBy = params.get('orderBy');
    if (orderBy) {
      expect(orderBy).toBe(sortField);
      return;
    }

    // Check for OData $orderby parameter
    const oDataOrderBy = params.get('$orderby');
    if (oDataOrderBy) {
      expect(oDataOrderBy).toContain(`${sortField} ${sortOrder}`);
    }
  }

  validatePaginationParams(url: string, page: number): void {
    const urlObj = new URL(url);
    const pageParam = urlObj.searchParams.get('page');
    expect(pageParam).toBe(String(page));
  }

  async mockApiResponse(endpoint: string, responseData: any, status = 200): Promise<void> {
    await this.page.route(`**/api/**${endpoint}*`, (route) => {
      route.fulfill({
        status,
        contentType: 'application/ld+json',
        body: JSON.stringify(responseData)
      });
    });
  }

  async waitForApiCall(endpoint: string, timeout = 10000): Promise<Request> {
    return await this.page.waitForRequest(
      request => request.url().includes(endpoint),
      { timeout }
    );
  }

  async waitForApiResponse(endpoint: string, timeout = 10000): Promise<any> {
    const response = await this.page.waitForResponse(
      response => response.url().includes(endpoint),
      { timeout }
    );
    return await response.json();
  }
}
