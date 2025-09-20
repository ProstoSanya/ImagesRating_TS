import {AppError} from './AppError';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown){
    super(message, 403, {isOperational: true, details});
  }
}