import {Request, Response, NextFunction} from 'express';
import {ObjectId} from 'mongodb';
import User from '../models/User';
import {beautyDateString} from './profileController';
import {NotFoundError} from '../errors';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const usersList = await (await User.aggregate([
      {$project: {
        name: '$username',
        registeredAt: '$createdAt',
        images: '$images',
        imagesCount: {
          $size: {
            $cond: [
              {$isArray: '$images'},
              '$images',
              []
            ]
          }
        }
      }},
      {$sort: {registeredAt: -1}}
    ])
    .exec());
    return res.render('users', {
      list: usersList
	    .map((u) => ({
          ...u,
          likesCount: u.images ? u.images.reduce((p: number, c: object & {ratings: unknown[]}) => p + c.ratings.length, 0) : 0,
          registeredAt: beautyDateString(u.registeredAt)
        }))
		.filter((u) => u.imagesCount || (req.session?.username && req.session.username === u.name))
    });
  }
  catch(err){
    next(err);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const user = await User.findOne({'username': req.params.username});
    if(!user){
      throw new NotFoundError('User not found');
    }
    const authorId = user._id.toString();
    const authorName = user.username;
    const images = user.images.map((img) => ({
      _id: authorId, 
      username: authorName,
      filename: img.filename,
      likes: img.ratings.map((rating) => rating.toString()),
      title: img.title
    }));
    return res.render('user', {images, authorId, authorName, isUserPage: true});
  }
  catch (err) {
    next(err);
  }
};
