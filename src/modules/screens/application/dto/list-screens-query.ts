export interface ListScreensQuery {
  search?: string;
  status?: 'online' | 'offline' | 'uninitialized' | 'restarting';
  groupId?: string;
  page?: number;
  perPage?: number;
}
