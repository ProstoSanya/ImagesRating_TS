import {AppError} from './AppError';

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: unknown){
    super(message, 400, {isOperational: true, details});
  }
}