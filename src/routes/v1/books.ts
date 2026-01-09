import { Router } from 'express';

import { BookController } from '../../controllers/BookController';
import { checkJwt } from '../../middleware/checkJwt';
import { checkRole } from '../../middleware/checkRole';
import { validatorCreateBook } from '../../middleware/validation/book/validatorCreateBook';
import { validatorUpdateBook } from '../../middleware/validation/book/validatorUpdateBook';

const router = Router();
const bookController = new BookController();

// GET /api/v1/books - список всіх книг (доступно всім)
router.get('/', bookController.list);

// GET /api/v1/books/:id - одна книга за ID (доступно всім)
router.get('/:id', bookController.one);

// POST /api/v1/books - створення нової книги (тільки адміністратор)
router.post('/', [checkJwt, checkRole(['ADMINISTRATOR']), validatorCreateBook], bookController.save);

// PUT /api/v1/books/:id - оновлення книги (тільки адміністратор)
router.put('/:id', [checkJwt, checkRole(['ADMINISTRATOR']), validatorUpdateBook], bookController.update);

// DELETE /api/v1/books/:id - видалення книги (тільки адміністратор)
router.delete('/:id', [checkJwt, checkRole(['ADMINISTRATOR'])], bookController.delete);

export default router;
