import express, {Request, Response, NextFunction} from 'express';
import {AppError, NotFoundError, InternalServerError} from '../errors';

const getErros: (error: AppError) => string[] = (error: AppError) => {  
  const detailsType = typeof error?.details;
  
  if (detailsType === 'object' && detailsType !== null) {
    const details = error.details as {[key: string]: unknown};
    if ('errors' in details && Array.isArray(details.errors)) {
      return details.errors.filter((msg) => typeof msg === 'string').map((msg) => msg);
	}
  }
  
  return [];
};

export const setError404 = (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError());
};

export const sendErrorPage = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if(res.headersSent){
    return;
  }
  
  const appError = err instanceof AppError ? err : new InternalServerError(err instanceof Error ? err.message : 'Server error');
  const status = res.statusCode >= 400 ? res.statusCode : appError.statusCode;
  res.status(status);

  if(req.headers['x-requested-with'] === 'XMLHttpRequest' || req.accepts(['html', 'json']) === 'json'){
    return res.json({
      error: appError.message,
      status,
      ...(appError.details ? {details: appError.details} : {}),
    });
  }
  
  return res.render('error', {
    errorMessage: appError.message,
    errors: getErros(appError),
    code: status
  });
};
