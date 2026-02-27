export interface ScreenGroup {
  id: string;
  name: string;
  settings: { timezone?: string } & Record<string, unknown>;
  screensCount: number;
  createdAt: string;
  updatedAt: string;
}
