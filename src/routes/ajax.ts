import express, {Request, Response, NextFunction} from 'express';
import {ObjectId} from 'mongodb';
import User from '../models/User';


import {requireLogin} from '../middlewares/auth';
import {isAjaxRequestValidator, ajaxLikeValidator} from '../validators';
import {validate} from '../middlewares/validate';
import {postAjax} from '../controllers/ajaxController';

const router = express.Router();

router.post('/ajax', requireLogin, isAjaxRequestValidator, ajaxLikeValidator, validate, postAjax);

export default router;