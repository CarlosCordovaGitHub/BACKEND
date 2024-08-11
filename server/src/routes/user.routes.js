// /routes/user.routes.js
import express from 'express';
import { getUserData, updateUserData, changePassword } from '../controllers/user.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/user/data/:userId', auth, getUserData);
router.put('/user/data/:userId', auth, updateUserData); // Añadido
router.post('/user/change-password', auth, changePassword);

export default router;
