import {header, body, param, query} from 'express-validator';
import mongoose from 'mongoose';
import {BadRequestError} from '../errors';

export const isObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

export const registerValidator = [
  body('username')
    .trim()
    .isLength({min: 4, max: 16}).withMessage('Username: 4-16 characters')
    .matches(/^[a-zA-Z0-9_\-\.]+$/).withMessage('Latin alphabet, numbers, _-.')
    .toLowerCase(),
  body('email')
    .trim()
    .isEmail().withMessage('Incorrect e-mail')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({min: 6, max: 24}).withMessage('Password: 6-24 characters'),
];

export const loginValidator = [
  body('username').trim().notEmpty().withMessage('Enter your login'),
  body('password').trim().notEmpty().withMessage('Enter your password'),
];

export const uploadImageValidator = [
  body('imageTitle')
    .isLength({min: 4, max: 16}).withMessage('Image title 4-16 characters')
    .trim()
];

export const isAjaxRequestValidator = [
  header('x-requested-with')
    .custom((value) => {
      if(value !== 'XMLHttpRequest'){
        throw new BadRequestError('Invalid or missing header "x-requested-with"');
      }
      return true;
    })
];

export const ajaxLikeValidator = [
  body('authorId')
    .custom((v) => isObjectId(v)).withMessage('Incorrect authorId'),
  body('fileName')
    .trim()
    .matches(/^[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i).withMessage('Incorrect file name'),
];

export const galleryQueryValidator = [
  query('sortBy')
    .optional()
    .isIn(['latest', 'popular']).withMessage('sortBy: latest | popular'),
];