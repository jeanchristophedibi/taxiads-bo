import type { AppError } from '@/shared/domain/app-error';
import type { PaginatedResult } from '@/shared/domain/paginated';
import type { Result } from '@/shared/domain/result';
import type { Screen } from '../../domain/entities/screen';
import type { ScreenRepository } from '../../domain/repositories/screen-repository';
import type { ListScreensQuery } from '../dto/list-screens-query';

export class ListScreens {
  constructor(private readonly repository: ScreenRepository) {}

  execute(query: ListScreensQuery): Promise<Result<PaginatedResult<Screen>, AppError>> {
    return this.repository.list(query);
  }
}
