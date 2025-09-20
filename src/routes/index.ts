import express from 'express';
import {getHome} from '../controllers/galleryController';

const router = express.Router();

router.get('/', getHome);

export default router;
