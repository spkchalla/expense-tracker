import { Router } from 'express';
import { NeedController } from '../controllers/needController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createNeedSchema,
  updateNeedSchema,
  createContributionSchema,
} from '../validators/needValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', NeedController.getNeeds);
router.post('/', validate(createNeedSchema), NeedController.createNeed);
router.get('/:id', NeedController.getNeedById);
router.patch('/:id', validate(updateNeedSchema), NeedController.updateNeed);
router.delete('/:id', NeedController.archiveNeed);

router.get('/:id/contributions', NeedController.getContributions);
router.post(
  '/:id/contributions',
  validate(createContributionSchema),
  NeedController.addContribution
);
router.delete('/:id/contributions/:contributionId', NeedController.deleteContribution);

export default router;
