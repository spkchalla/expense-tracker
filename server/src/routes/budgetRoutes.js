import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateBudgetSchema } from '../validators/budgetValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/:month', BudgetController.getBudget);
router.put('/:month', validate(updateBudgetSchema), BudgetController.setBudget);

export default router;
