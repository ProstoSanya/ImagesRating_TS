import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import {AppError, BadRequestError, ConflictError} from '../errors';

export const getRegister = (_req: Request, res: Response) => res.render('register');
export const getLogin = (_req: Request, res: Response) => res.render('login');

export const postRegister = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const validation = validationResult(req);
    if(!validation.isEmpty()){
      throw new BadRequestError('', {errors: validation.array().map((e) => e.msg)});
    }
	const {username, password, email} = req.body;
	const result = await User.findOne({$or:[{'email': {$regex: email, $options: 'i'}}, {'username': {$regex: username, $options: 'i'}}]}).exec();
	if(result){
	  throw new ConflictError('User with this username or e-mail already exists');
	}

    const hash = await bcrypt.hash(password, 10);
	const user = await User.create({
	  username,
	  email,
	  password: hash,
	  images: []
	});

	req.session.username = user.username;
	req.session.userId = user._id.toString();
	req.session.message = 'Congratulations on your successful registration!';
	
    req.session.save(() => res.redirect('/profile'));
  }
  catch(err: unknown){
    const error = err instanceof AppError
	  ? (err.details as {errors: string[]}).errors.map((msg) => msg)
	  : err instanceof Error ? err.message : 'Unknown error';
	return res.render('register', Object.assign({error}, req.body));
  }
}

export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {username, password} = req.body;  
	
    const user = await User.findOne({$or:[{'email': {$regex: username, $options: 'i'}}, {'username': {$regex: username, $options: 'i'}}]});	
    if (!user) {
      res.status(401);
      return res.render('login', {error: 'There is no user with this login/email!'});
    }
  
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401);
      return res.render('login', {error: 'Incorrect password!'});
    }
	  
    req.session.userId = user._id.toString();	
    req.session.username = user.username;
    req.session.save((err: Error) => {
      if(err){
        return next(err);
      }
      return res.redirect('/profile');
    });
  }
  catch (err) {
    next(err);
  }
}

export const getLogout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    if (!res.headersSent) {
      return res.redirect('/login');
    }
  });
};