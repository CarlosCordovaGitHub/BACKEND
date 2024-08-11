// routes/serviceBill.routes.js
import express from 'express';
import { getServiceBills, payServiceBill, createPaypalOrder, capturePaypalOrder } from '../controllers/serviceBill.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/service-bills', auth, getServiceBills);
router.post('/service-bills/pay/:billId', auth, payServiceBill);
router.post('/service-bills/paypal/create-order/:billId', auth, createPaypalOrder);
router.get('/service-bills/paypal/success', auth, capturePaypalOrder);

export default router;
