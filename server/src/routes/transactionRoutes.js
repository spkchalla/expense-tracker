import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  syncTransactionsSchema,
} from '../validators/transactionValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', TransactionController.getTransactions);
router.get('/export', TransactionController.exportCsv);
router.post('/', validate(createTransactionSchema), TransactionController.createTransaction);
router.post('/sync', validate(syncTransactionsSchema), TransactionController.syncTransactions);
router.get('/:id', TransactionController.getTransactionById);
router.patch('/:id', validate(updateTransactionSchema), TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;
