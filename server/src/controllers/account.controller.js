import Account from "../models/Account.js";
import User from "../models/user.model.js";
import ServiceBill from "../models/ServiceBill.js";

const generateAccountNumber = () => {
  return Math.random().toString().slice(2, 22);
};

const generateRandomAmount = () => {
  return (Math.random() * (100 - 20) + 20).toFixed(2); // Genera un valor aleatorio entre 20 y 100
};

const generateServiceBills = async (userId) => {
  // Verificar si ya existen facturas de servicios básicos para el usuario
  const existingBills = await ServiceBill.find({ userId });

  if (existingBills.length > 0) {
    // Si ya existen facturas, no creamos nuevas
    console.log("Las facturas de servicios básicos ya existen para este usuario.");
    return;
  }

  const services = ['electricidad', 'agua'];
  const currentDate = new Date();
  const issueDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
  const dueDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

  for (const service of services) {
    const newBill = new ServiceBill({
      userId: userId,
      serviceType: service,
      amount: generateRandomAmount(),
      issueDate: issueDate,
      dueDate: dueDate,
    });
    await newBill.save();
  }
};

export const createAccount = async (req, res) => {
  try {
    const { accountType } = req.body;
    const userId = req.user.id; // Asegúrate de que el usuario esté autenticado y el middleware de autenticación esté configurado correctamente

    const newAccount = new Account({
      userId: userId,
      accountType: accountType,
      balance: 0, // Saldo inicial de $100
      accountNumber: generateAccountNumber(),
    });

    const savedAccount = await newAccount.save();

    await generateServiceBills(userId); // Generar facturas de servicios básicos

    res.status(201).json(savedAccount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id; // Utilizar req.user.id
    const accounts = await Account.find({ userId }).populate(
      "userId",
      "fullName"
    );
    res.status(200).json(accounts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const accountId = req.params.id;
    const userId = req.user.id; // Utilizar req.user.id
    const account = await Account.findOneAndDelete({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const checkAccountExists = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const account = await Account.findOne({ accountNumber }).populate('userId', 'fullName');
    if (account) {
      return res.status(200).json({
        exists: true,
        account: {
          userId: account.userId.fullName,
        },
      });
    } else {
      return res.status(404).json({ exists: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
