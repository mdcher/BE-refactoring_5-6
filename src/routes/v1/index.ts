import { Router } from 'express';

import auth from './auth';
import books from './books';
import loans from './loans';
import users from './users';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/books', books);
router.use('/loans', loans);

export default router;
