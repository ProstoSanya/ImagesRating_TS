import {AppError} from './AppError';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown){
    super(message, 401, {isOperational: true, details});
  }
}