import type { HttpDashboardRepository } from '../../infrastructure/repositories/http-dashboard-repository';

export class GetKpis {
  constructor(private readonly repository: HttpDashboardRepository) {}

  execute() {
    return this.repository.getKpis();
  }
}
