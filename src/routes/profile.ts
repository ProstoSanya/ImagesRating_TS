import express from 'express';
import {requireLogin} from '../middlewares/auth';
import {uploadImageValidator} from '../validators';
import {getProfile, postUpload} from '../controllers/profileController';

const router = express.Router();

router.get('/profile', requireLogin, getProfile);

router.post('/profile/upload',
  requireLogin,
  uploadImageValidator,
  postUpload
);

export default router;
