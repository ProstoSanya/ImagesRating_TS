import {AppError} from './AppError';

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: unknown){
    super(message, 500, {isOperational: true, details});
  }
}