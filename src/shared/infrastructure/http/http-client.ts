export interface HttpRequest {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<T>;
}
