import express from 'express';
import { forgotPassword, verifyCode, resetPassword, sendVerificationCode, sendSupportEmail, sendVerificateTransactionCode } from '../controllers/recovery.controller.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);
router.post('/send-verification-code', sendVerificationCode);
router.post('/send-support-email', sendSupportEmail);
router.post('/send-verificate-transaction-code', sendVerificateTransactionCode);

export default router;
