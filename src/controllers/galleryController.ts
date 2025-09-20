import {Request, Response, NextFunction} from 'express';
import {PipelineStage} from 'mongoose';
import User from '../models/User';

export const getImages = async (sortBy: 'latest' | 'popular', limit = 0) => {
  const settings: PipelineStage[] = [
    {$unwind: '$images'},
    {
      $project: {
        title: '$images.title',
        username: '$username',
        filename: '$images.filename',
        likes: '$images.ratings',
        likesCount: {$size: '$images.ratings'},
        uploadedAt: '$images.uploadedAt',
        authorId: '$_id'
      }
    },
	{$sort: sortBy === 'popular' ? {likesCount: -1, uploadedAt: -1} : {uploadedAt: -1}},
  ];
  
  if(limit > 0){
    settings.push({$limit: limit});
  }
  return (await (await User.aggregate(settings).exec())).map((img) => {
    for (let i=0;i<img.likes.length;i++) {
      img.likes[i] = img.likes[i].toString();
	}
	return img;
  });
};

export const getHome = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const latestImages = await getImages('latest', 6);
    const popularImages = await getImages('popular', 6);
    return res.render('index', {latestImages, popularImages});
  }
  catch(err){
    next(err);
  }
};

export const getGallery = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const sortBy = (String(req.query.sortBy || 'latest') === 'popular' ? 'popular' : 'latest') as 'latest' | 'popular';
    const images = await getImages(sortBy);
    return res.render('gallery', {images, sortBy});
  }
  catch(err){
    next(err);
  }
};