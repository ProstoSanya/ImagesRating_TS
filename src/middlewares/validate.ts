import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
import {BadRequestError} from '../errors';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if(result.isEmpty()){
    return next();
  }
  next(new BadRequestError('Validation failed', {errors: result.array().map((e) => e.msg)}));
};