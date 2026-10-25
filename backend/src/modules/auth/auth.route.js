import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { registerSchema, loginSchema } from './auth.schema.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register); // POST /register
router.post('/login', validateBody(loginSchema), authController.login); // POST /login
router.post('/logout', requireAuth, authController.logout); // POST /logout
router.get('/me', requireAuth, authController.me); // GET /me

export default router;

