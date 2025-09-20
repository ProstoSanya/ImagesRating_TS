import {AppError} from './AppError';

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', details?: unknown){
    super(message, 404, {isOperational: true, details});
  }
}