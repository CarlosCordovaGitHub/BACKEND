import Account from '../models/Account.js';
import Transfer from '../models/transfer.model.js';
import User from '../models/user.model.js'; // Asegúrate de importar el modelo User
import mongoose from 'mongoose';
import crypto from 'crypto';

const decrypt = (text) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const encrypt = (text) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const transferFunds = async (req, res) => {
  const { fromAccountId, toAccountNumber, amount, beneficiaryName, description, notificationEmail } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Iniciando transferencia...");

    const fromAccount = await Account.findById(fromAccountId).session(session);
    if (!fromAccount) {
      console.error("Cuenta de origen no encontrada");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Cuenta de origen no encontrada" });
    }

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber }).session(session);
    if (!toAccount) {
      console.error("Cuenta de destino no encontrada");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Cuenta de destino no encontrada" });
    }

    if (fromAccount.balance < amount) {
      console.error("Fondos insuficientes");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Fondos insuficientes" });
    }

    let finalBeneficiaryName = beneficiaryName;
    if (!beneficiaryName) {
      const toUser = await User.findById(toAccount.userId).session(session);
      if (toUser) {
        finalBeneficiaryName = toUser.fullName;
      }
    }

    // Actualizar saldos de cuentas
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save({ session });
    await toAccount.save({ session });

    // Crear un nuevo registro de transferencia
    const newTransfer = new Transfer({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      amount,
      beneficiaryName: encrypt(finalBeneficiaryName),
      description: encrypt(description),
      notificationEmail
    });

    await newTransfer.save({ session });

    await session.commitTransaction();
    session.endSession();

    console.log("Transferencia realizada con éxito");

    return res.status(200).json({ message: "Transferencia realizada con éxito", transfer: newTransfer });
  } catch (error) {
    console.error("Error en la transferencia:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find().populate('fromAccount toAccount');
    const decryptedTransfers = transfers.map((transfer) => ({
      ...transfer._doc,
      beneficiaryName: decrypt(transfer.beneficiaryName),
      description: decrypt(transfer.description),
    }));
    return res.status(200).json(decryptedTransfers);
  } catch (error) {
    console.error("Error obteniendo transferencias:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  const { accountId } = req.query;

  try {
    const transactions = await Transfer.find({
      $or: [{ fromAccount: accountId }, { toAccount: accountId }]
    })
    .populate({
      path: 'fromAccount toAccount',
      populate: {
        path: 'userId',
        select: 'fullName'
      }
    })
    .sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};