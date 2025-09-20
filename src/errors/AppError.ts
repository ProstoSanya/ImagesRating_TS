export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    options?: {isOperational?: boolean; details?: unknown}
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? (statusCode < 500);
    this.details = options?.details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const isAppError = (e: unknown): e is AppError =>
  e instanceof AppError;
