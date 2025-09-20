import express from 'express';
import {alreadyLoggedIn} from '../middlewares/auth';
import {registerValidator, loginValidator} from '../validators';
import {validate} from '../middlewares/validate';
import {getRegister, getLogin, postRegister, postLogin, getLogout} from '../controllers/authController';

const router = express.Router();

router.get('/register', alreadyLoggedIn, getRegister);
router.post('/register', registerValidator, postRegister);
router.get('/login', alreadyLoggedIn, getLogin);
router.post('/login', alreadyLoggedIn, loginValidator, validate, postLogin);
router.get('/logout', getLogout);

export default router;
