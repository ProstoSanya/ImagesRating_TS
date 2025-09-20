import {Request, Response, NextFunction} from 'express';
import {UnauthorizedError} from '../errors';

export const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  try{
    if (!req.session?.userId) {
      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
		throw new UnauthorizedError();
      }
      return res.redirect('/login');
    }
    next();
  }
  catch(err) {
    return next(err);
  }
}

export const alreadyLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
	  return res.redirect('/profile');
  }
  next();
}