// /controllers/recovery.controller.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import SibApiV3Sdk from 'sib-api-v3-sdk';

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let verificationCodes = {};

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');
    const user = await collection.findOne({ email });

    if (user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiration = new Date(Date.now() + 3600000);

      verificationCodes[email] = { code, expiration };

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = { name: 'AndesInvest Support', email: 'noreply.andesinvest@gmail.com' };
      sendSmtpEmail.to = [{ email: email }];
      sendSmtpEmail.subject = 'Código de verificación';
      sendSmtpEmail.htmlContent = `<p>Hola  <b>${user.fullName}</b>,</p><p>Utiliza el código  <b>${code}</b>  para recuperar tu contraseña</p>`;

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      res.send('Correo enviado');
    } else {
      res.status(404).send('Correo no encontrado');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error al procesar la solicitud');
  } finally {
    await mongoClient.close();
  }
};

export const verifyCode = async (req, res) => {
  const { email, code, userData } = req.body;
  const verificationData = verificationCodes[email];

  if (!verificationData || verificationData.code !== code || verificationData.expiration < new Date()) {
    return res.status(400).send('Código de verificación incorrecto o expirado');
  }

  try {
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');

    if (userData) {
      // Registro de usuario
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const hashedConfirmPassword = await bcrypt.hash(userData.confirmPassword, 10);
      const newUser = { ...userData, password: hashedPassword, confirmPassword: hashedConfirmPassword, Verificado: true };

      await collection.insertOne(newUser);
      res.send('Código verificado y usuario registrado con éxito');
    } else {
      // Recuperación de contraseña
      res.send('Código verificado con éxito');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error al procesar la solicitud');
  } finally {
    await mongoClient.close();
  }

  delete verificationCodes[email];
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');
    const result = await collection.updateOne(
      { email },
      { $set: { password: passwordHash, updatedAt: new Date() } }
    );

    if (result.matchedCount === 1) {
      res.send('Contraseña cambiada con éxito');
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error al procesar la solicitud');
  } finally {
    await mongoClient.close();
  }

  delete verificationCodes[email];
};

export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');
    const user = await collection.findOne({ email });

    if (!user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiration = new Date(Date.now() + 3600000);

      verificationCodes[email] = { code, expiration };

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = { name: 'AndesInvest Support', email: 'noreply.andesinvest@gmail.com' };
      sendSmtpEmail.to = [{ email: email }];
      sendSmtpEmail.subject = 'Código de verificación';
      sendSmtpEmail.htmlContent = `<p>Saludos,</p>
        <p>¡Estamos encantados de que quieras ser parte de la familia AndesInvest! Apreciamos tu interés en unirte a nosotros y estamos aquí para ayudarte en cada paso del camino.</p>
        <p>El código para completar tu registro es: <b>${code}</b></p>
        <p>Por favor, ingresa este código en nuestro sitio web para finalizar tu proceso de registro.</p>
        <p>¡Bienvenido a AndesInvest! Estamos emocionados de tenerte con nosotros.</p>
        <p>Saludos,</p>
        <p>El equipo de AndesInvest</p>
        `;

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      res.send('Correo enviado');
    } else {
      res.status(400).send('Usuario ya registrado');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error al procesar la solicitud');
  } finally {
    await mongoClient.close();
  }
};

export const sendSupportEmail = async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    // Conectar a la base de datos y obtener el usuario
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { _id, username, phoneNumber, cedula } = user;

    // Configuración del correo para soporte técnico
    const supportEmail = new SibApiV3Sdk.SendSmtpEmail();
    supportEmail.sender = { name: 'Solicitud de Asistencia Técnica', email: 'noreply.andesinvest@gmail.com' };
    supportEmail.to = [
        { email: 'noreply.andesinvest@gmail.com' }
        //{ email: 'andres.zambrano03@epn.edu.ec' },
        //{ email: 'dilan.andrade@epn.edu.ec' },
        //{ email: 'hernan.sanchez@epn.edu.ec' },
        //{ email: 'galo.tarapues@epn.edu.ec' },
        //{ email: 'carlos.cordova02@epn.edu.ec' }
    ];
    supportEmail.subject = 'Asistencia Técnica - ' + (subject || 'Asistencia Técnica');
    supportEmail.htmlContent = `
        <p>Solicitud de asistencia técnica de:</p>
        <p>ID de usuario: ${_id}</p>
        <p>Nombre de usuario: ${username}</p>
        <p>Correo electrónico: ${email}</p>
        <p>Número de teléfono: ${phoneNumber}</p>
        <p>Cédula: ${cedula}</p>
        <p>Mensaje:</p>
        <p>${message}</p>
    `;


    // Configuración del correo para el usuario
    const userEmail = new SibApiV3Sdk.SendSmtpEmail();
    userEmail.sender = { name: 'Soporte Tecnico AndesInvest', email: 'noreply.andesinvest@gmail.com' };
    userEmail.to = [{ email }];
    userEmail.subject = 'Solicitud de asistencia técnica en revisión';
    userEmail.htmlContent = `
      <p>Estimado/a ${username},</p>
      <p>Hemos recibido su solicitud de asistencia técnica. Nuestro equipo se comunicará con usted lo antes posible.</p>
      <p>Atentamente,</p>
      <p>Soporte AndesInvest</p>
    `;

    // Enviar ambos correos
    await apiInstance.sendTransacEmail(supportEmail);
    await apiInstance.sendTransacEmail(userEmail);

    res.json({ message: 'Correos enviados correctamente' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  } finally {
    await mongoClient.close();
  }
};

export const sendVerificateTransactionCode = async (req, res) => {
    const { email, code } = req.body;
  
    // Conectar a la base de datos y obtener el usuario
    await mongoClient.connect();
    const database = mongoClient.db('test');
    const collection = database.collection('users');
    const user = await collection.findOne({ email });
  
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
  
    const userName = user.fullName;
  
    // Verifica si ya existe un código para este email
    if (verificationCodes[email]) {
      const verificationData = verificationCodes[email];
  
      // Verifica si el código es correcto y no ha expirado
      if (code && (verificationData.code !== code || verificationData.expiration < new Date())) {
        return res.status(400).send('Código de verificación incorrecto o expirado');
      }
  
      if (code) {
        delete verificationCodes[email];
        return res.send('Código verificado correctamente');
      }
    }
  
    // Genera un nuevo código y lo envía por correo
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 3600000);
  
    verificationCodes[email] = { code: newCode, expiration };
  
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'AndesInvest Support', email: 'noreply.andesinvest@gmail.com' };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.subject = 'Código de verificación para la transacción';
    sendSmtpEmail.htmlContent = `<p>Hola  <b>${userName}</b>,</p><p>El código para realizar tu transferencia es: <b>${newCode}</b></p>`;
  
    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      res.send('Correo enviado');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al enviar el correo');
    }
  };
  
