import { Router } from 'express';

import { LoanController } from '../../controllers/LoanController';
import { checkJwt } from '../../middleware/checkJwt';
import { checkRole } from '../../middleware/checkRole';
import { validatorCreateLoan } from '../../middleware/validation/loan/validatorCreateLoan';
import { validatorUpdateLoan } from '../../middleware/validation/loan/validatorUpdateLoan';

const router = Router();
const loanController = new LoanController();

// GET /api/v1/loans - список всіх видач (доступно всім)
router.get('/', loanController.list);

// GET /api/v1/loans/:id - одна видача за ID (доступно всім)
router.get('/:id', loanController.one);

// POST /api/v1/loans - створення нової видачі (тільки адміністратор)
router.post('/', [checkJwt, checkRole(['ADMINISTRATOR']), validatorCreateLoan], loanController.save);

// PUT /api/v1/loans/:id - оновлення видачі (тільки адміністратор)
router.put('/:id', [checkJwt, checkRole(['ADMINISTRATOR']), validatorUpdateLoan], loanController.update);

// DELETE /api/v1/loans/:id - видалення видачі (тільки адміністратор)
router.delete('/:id', [checkJwt, checkRole(['ADMINISTRATOR'])], loanController.delete);

export default router;
