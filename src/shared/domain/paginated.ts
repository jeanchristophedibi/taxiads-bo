export interface PaginatedMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}
