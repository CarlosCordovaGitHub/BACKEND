// /controllers/user.controller.js
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI;

const mongoClient = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

export const getUserData = async (req, res) => {
  const { userId } = req.params;

  try {
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).send('Usuario no encontrado.');
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los datos del usuario.');
  } finally {
    await mongoClient.close();
  }
};

export const updateUserData = async (req, res) => {
  const { userId } = req.params;
  const { phoneNumber, address } = req.body;

  try {
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { phoneNumber, address, modifiedAt: new Date() } }
    );

    if (result.matchedCount === 1) {
      res.status(200).json({ message: 'Información actualizada con éxito.' });
    } else {
      res.status(404).send('Usuario no encontrado.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la solicitud.');
  } finally {
    await mongoClient.close();
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, userId } = req.body;

  try {
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).send('Usuario no encontrado.');
    }

    const passwordIsValid = await bcrypt.compare(currentPassword, user.password);

    if (!passwordIsValid) {
      return res.status(400).send('La contraseña actual no es correcta.');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: newPasswordHash, updatedAt: new Date() } }
    );

    if (result.matchedCount === 1) {
      res.send('Contraseña actualizada con éxito.');
    } else {
      res.status(500).send('Error al actualizar la contraseña.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al procesar la solicitud.');
  } finally {
    await mongoClient.close();
  }
};
