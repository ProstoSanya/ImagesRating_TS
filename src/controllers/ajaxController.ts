import {Request, Response, NextFunction} from 'express';
import {ObjectId} from 'mongodb';
import User from '../models/User';
import {BadRequestError, NotFoundError} from '../errors';

export const postAjax = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const {authorId, fileName} = req.body as {authorId: string, fileName: string};
    const userId = req.session.userId!;
    if(userId === authorId){
      throw new BadRequestError('You can only like other users images');
    }
    const filter = {'_id': new ObjectId(authorId), 'images.filename': fileName};
    const user = await User.findOne(filter).exec();
    if(!user){
      throw new NotFoundError('User not found');
    }
    const img = user.images.find((i) => i.filename === fileName);
    if(!img){
      throw new NotFoundError('Image not found');
    }
    const userObjectId = new ObjectId(userId);
    const likesCount = img.ratings.length;
    const likeExists = img.ratings.find((id) => id.toString() === userId);
    const arrayFilters = [{'img.filename': fileName}];
    let responseObj: {status?: string; likesCount?: number; message?: string;} = {};
    if(!likeExists){ // add like
      const updateRes = await User.updateOne(filter, {$push: {'images.$[img].ratings': userObjectId}}, {arrayFilters}).exec();
      if(updateRes){
        responseObj = {status: 'added', likesCount: likesCount + 1};
      }
      else{
        responseObj = {status: 'error', message: 'An error occurred while trying to add a record to the database.'};
      }
    }
    else{ // remove like
      const updateRes = await User.updateOne(filter, {$pull: {'images.$[img].ratings': userObjectId}}, {arrayFilters}).exec();
      if(updateRes){
        responseObj = {status: 'removed', likesCount: likesCount - 1};
      }
      else{
        responseObj = {status: 'error', message: 'An error occurred while trying to add a record to the database.'};
      }
    }
    return res.json(responseObj);
  }
  catch(err){
    return next(err);
  }
};