// src/controllers/serviceBill.controller.js
import ServiceBill from '../models/ServiceBill.js';
import paypal from '../paypal.config.js';

export const getServiceBills = async (req, res) => {
  try {
    const userId = req.user.id;
    const bills = await ServiceBill.find({ userId });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const payServiceBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.id;

    const bill = await ServiceBill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    if (bill.paid) {
      return res.status(400).json({ message: "La factura ya está pagada" });
    }

    const account = await Account.findOne({ userId, balance: { $gte: bill.amount } });
    if (!account) {
      return res.status(400).json({ message: "Fondos insuficientes en la cuenta" });
    }

    account.balance -= bill.amount;
    bill.paid = true;

    await account.save();
    await bill.save();

    res.status(200).json({ message: "Factura pagada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPaypalOrder = async (req, res) => {
  const { billId } = req.params;
  const bill = await ServiceBill.findById(billId);

  if (!bill) {
    return res.status(404).json({ message: "Factura no encontrada" });
  }

  if (bill.paid) {
    return res.status(400).json({ message: "La factura ya está pagada" });
  }

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    transactions: [{
      amount: {
        currency: 'USD',
        total: bill.amount.toFixed(2)
      },
      description: `Pago de factura de ${bill.serviceType}`
    }],
    redirect_urls: {
      return_url: `${process.env.FRONTEND_URL}/service-bills/paypal/success?billId=${billId}`,
      cancel_url: `${process.env.FRONTEND_URL}/service-bills/paypal/cancel`
    }
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(201).json({ id: payment.id, links: payment.links });
    }
  });
};

export const capturePaypalOrder = async (req, res) => {
  const { PayerID, paymentId, billId } = req.query;

  const execute_payment_json = {
    payer_id: PayerID,
    transactions: [{
      amount: {
        currency: 'USD',
        total: (await ServiceBill.findById(billId)).amount.toFixed(2)
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
    if (error) {
      res.status(500).json({ message: error.response });
    } else {
      const bill = await ServiceBill.findById(billId);
      bill.paid = true;
      await bill.save();
      res.status(200).json({ message: 'Pago realizado con éxito', payment });
    }
  });
};
