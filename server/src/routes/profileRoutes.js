import { Router } from 'express';
import { ProfileController } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/authValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', ProfileController.getProfile);
router.patch('/', validate(updateProfileSchema), ProfileController.updateProfile);

export default router;
