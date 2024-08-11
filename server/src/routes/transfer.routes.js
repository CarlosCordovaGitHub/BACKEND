import express from 'express';
import { transferFunds, getTransfers, getTransactions } from '../controllers/transfer.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/transfer', auth, transferFunds);
router.get('/transfers', auth, getTransfers);
router.get('/transactions', auth, getTransactions);
export default router;
