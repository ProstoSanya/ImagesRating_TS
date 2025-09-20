import path from 'node:path';
import http from 'node:http';
import dotenv from 'dotenv';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import express, {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import {mongoStore, closeMongoConnection} from './db';
import {setError404, sendErrorPage} from './middlewares/errors';
import authRoutes from './routes/auth';
import homepageRoutes from './routes/index';
import userRoutes from './routes/user';
import profileRoutes from './routes/profile';
import galleryRoutes from './routes/gallery';
import ajaxRoutes from './routes/ajax';

declare module 'express-session' {
  export interface SessionData {
    userId?: string;
    username?: string;
    message?: string;
    error?: string | string[];
  }
}

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST ?? '';
const DB_PORT = process.env.DB_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY ?? '';
const PUBLIC_DIR = process.env.PUBLIC_DIR || 'public';

const app = express();

app.set('trust proxy', 1);

// security
app.use(helmet());
app.use(rateLimit({windowMs: 60_000, max: 100}));

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// static
app.use(express.static(path.join(__dirname, PUBLIC_DIR)));

// upload limit
app.use(fileUpload({
  limits: {fileSize: 10 * 1024 * 1024} // 10 mb
}));

// sessions
app.use(session({
  secret: SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days
  }
}));

// locals for EJS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.userId = req.session?.userId || null;
  res.locals.username = req.session?.username || null;
  res.locals.message = req.session?.message || '';
  res.locals.error = req.session?.error || '';
  if (req.session) {
    delete req.session.message;
    delete req.session.error;
  }
  next();
});

// routes
app.use('/', authRoutes);
app.use('/', homepageRoutes);
app.use('/', profileRoutes);
app.use('/', userRoutes);
app.use('/', galleryRoutes);
app.use('/', ajaxRoutes);

// 404 & errors
app.use(setError404);
app.use(sendErrorPage);

let server: http.Server;

(async () => {
  try {
    await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);	
    server = app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`));
  }
  catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})();


process.on('SIGINT', async () => {
  await closeMongoConnection();
  server?.close();
  process.exit(1);
});
process.on('unhandledRejection', async (err) => {
  console.error(err);
  await closeMongoConnection();
  server?.close();
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error(err);
  server?.close();
  closeMongoConnection().finally(() => {
    process.exit(1);
  });
});
