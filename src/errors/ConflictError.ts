import {AppError} from './AppError';

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown){
    super(message, 409, {isOperational: true, details});
  }
}