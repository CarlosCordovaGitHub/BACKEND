import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    fullName: { type: String },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    address: { type: String }, // Cambiado a tipo String para guardar la dirección como un solo campo
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    cedula: { type: Number, required: true }, // Cambiado a tipo Number para la cédula
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);