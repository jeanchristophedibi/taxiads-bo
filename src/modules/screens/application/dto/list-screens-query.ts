export interface ListScreensQuery {
  search?: string;
  status?: 'online' | 'offline' | 'uninitialized' | 'restarting';
  page?: number;
  perPage?: number;
}
