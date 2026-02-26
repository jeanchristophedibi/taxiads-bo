export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'NETWORK'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
