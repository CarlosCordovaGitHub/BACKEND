import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../libs/jwt.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, dateOfBirth, phoneNumber, address, cedula } = req.body;

    const userFound = await User.findOne({ email });

    if (userFound) {
      return res.status(400).json({
        message: ["El correo electrónico ya está en uso"],
      });
    }

    // Hashing the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating the user
    const newUser = new User({
      username,
      email,
      password: passwordHash,
      fullName,
      dateOfBirth,
      phoneNumber,
      address,
      cedula: Number(cedula), // Asegurarse de que cédula sea un número
    });

    // Saving the user in the database
    const userSaved = await newUser.save();

    // Create access token
    const token = await createAccessToken({
      id: userSaved._id,
    });

    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });


    res.json({
      _id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
      fullName: userSaved.fullName,
      dateOfBirth: userSaved.dateOfBirth,
      phoneNumber: userSaved.phoneNumber,
      lastLogin: userSaved.lastLogin,
      loginAttempts: userSaved.loginAttempts,
      address: userSaved.address,
      status: userSaved.status,
      cedula: userSaved.cedula, // Devolver la cédula en la respuesta
    });
  } catch (error) {
    console.error(error); // Imprime el error en la consola para debug
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userFound = await User.findOne({ email });

    if (!userFound) {
      return res.status(400).json({
        message: ["El correo electrónico no existe"],
      });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;
      await userFound.save();
      return res.status(400).json({
        message: ["La contraseña es incorrecta"],
      });
    }

    userFound.loginAttempts = 0;
    await userFound.save();
    userFound.lastLogin = Date.now();
    await userFound.save();

    const token = await createAccessToken({
      id: userFound._id,
      username: userFound.username,
    });

    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });

    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  } catch (error) {
    console.error(error); // Imprime el error en la consola para debug
    return res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.send(false);

  jwt.verify(token, TOKEN_SECRET, async (error, user) => {
    if (error) return res.sendStatus(401);

    const userFound = await User.findById(user.id);
    if (!userFound) return res.sendStatus(401);

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  });
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  });
  return res.sendStatus(200);
};
