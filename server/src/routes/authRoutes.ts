import { Router } from 'express';
import { register, login, usernameAvailable, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/username-available/:username', usernameAvailable);
router.get('/me', requireAuth, getMe);

export default router;
