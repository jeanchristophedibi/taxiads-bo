import type { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import type { Result } from '@/shared/domain/result';
import type { Screen } from '../entities/screen';

export interface ScreenRepository {
  list(params?: {
    search?: string;
    status?: 'online' | 'offline' | 'uninitialized' | 'restarting';
    page?: number;
    perPage?: number;
  }): Promise<Result<PaginatedResult<Screen>, AppError>>;

  getById(id: string): Promise<Result<Screen, AppError>>;

  restart(id: string): Promise<Result<void, AppError>>;
}
