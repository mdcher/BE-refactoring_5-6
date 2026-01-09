import { Router } from 'express';

import { BookController } from '../controllers/BookController';
import { validatorCreateBook } from '../middleware/validation/book/validatorCreateBook';

import page404 from './pages/404';
import pageRoot from './pages/root';
import v1 from './v1/';

const router = Router();
const bookController = new BookController();

router.use(`/v1`, v1);

router.use(pageRoot);
router.use(page404);

export default router;
