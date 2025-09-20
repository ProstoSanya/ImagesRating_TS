import express from 'express';
import {galleryQueryValidator} from '../validators';
import {validate} from '../middlewares/validate';
import {getGallery} from '../controllers/galleryController';

const router = express.Router();

router.get('/gallery', galleryQueryValidator, validate, getGallery);

export default router;
