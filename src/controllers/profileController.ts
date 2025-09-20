import path from 'node:path';
import fs from 'node:fs';
import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
import {ObjectId} from 'mongodb';
import User from '../models/User';
import {AppError, BadRequestError, NotFoundError} from '../errors';

export const beautyDateString = (d: Date) =>
  new Date(d).toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' });

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try{  
    const userId = new ObjectId(req.session.userId);
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
	}
    return res.render('profile', {
      userName: user.username,
      email: user.email,
      registeredAt: beautyDateString(user.createdAt!),
      images: user.images.slice(-4),
      totalImagesCount: user.images.length,
      totalLikesCount: user.images.reduce((p: number, c: any) => p + (c.ratings?.length || 0), 0)
    });
  }
  catch(err){
    next(err);
  }
};

export const postUpload = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId!;
  const username = req.session.username!;
  let uploadPath = '';  
  try {
    const validation = validationResult(req);
    if(!validation.isEmpty()){
      throw new BadRequestError('', {errors: validation.array().map((e) => e.msg)});
    }
    if (!req.files || !('image' in req.files)) {
      throw new BadRequestError('Specify file!');
    }
    const file = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
    const extOk = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
    if (!extOk) {
	  throw new BadRequestError('Only images (jpg, jpeg, png, webp) are allowed');
	}	
	const mimeType = file.mimetype.toLowerCase();
    if(mimeType !== 'image/png' && mimeType !== 'image/jpg' && mimeType !== 'image/jpeg'){
      throw new BadRequestError('Invalid file type (' + mimeType + ')');
    }
	
	// check image title
    const title = (req.body.imageTitle || '').toString().trim();
	const objUserId = new ObjectId(req.session.userId!);
    const result = await User.findOne({'_id': objUserId, 'images.title': {$regex: title, $options: 'i'}})
    if(result){
      throw new BadRequestError('An image with this name already exists!');
    }

    const STATIC_DIR = process.env.STATIC_DIR || 'public';
	const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
	
	const userDir = path.join(__dirname, `../${STATIC_DIR}/${UPLOAD_DIR}/${req.session.username}/`);
    await fs.promises.mkdir(userDir, {recursive: true});
    const fileExtension = file.name.split('.').length > 1 ? `.${file.name.split('.').pop()}` : '';
	const filename = `${Date.now()}${fileExtension}`;
    uploadPath = path.join(userDir, filename);
	
	if(!fs.existsSync(userDir)){
      await fs.promises.mkdir(userDir, {recursive: true});
	}
    await file.mv(uploadPath);

    const update = await User.updateOne(
      {_id: objUserId},
      {$push: {images: {filename, title, ratings: []}}}
    );
    if (update.modifiedCount !== 1) {
	  throw new BadRequestError('Failed to save to database');
	}
	
    req.session.message = 'Image successfully uploaded!';
  } catch (err) {
    if (uploadPath) {
      try {
        await fs.promises.unlink(uploadPath);
      } catch {}
    }
  
	req.session.error = err instanceof AppError
	  ? (err.details as {errors: string[]}).errors.map((msg) => msg)
	  : err instanceof Error ? err.message : 'Unknown error';
  }
  req.session.save(() => res.redirect('/profile'));
};