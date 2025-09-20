import express from 'express';
import {validate} from '../middlewares/validate';
import {getUsers, getUser} from '../controllers/userController';

const router = express.Router();

router.get('/users', getUsers);

router.get('/users/:username', getUser);

export default router;
