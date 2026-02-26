export interface Advertiser {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  campaignsCount: number;
  playLogsCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}
