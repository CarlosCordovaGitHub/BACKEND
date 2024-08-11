// /src/models/transfer.model.js
import mongoose from 'mongoose';
import crypto from 'crypto';

const transferSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  beneficiaryName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  notificationEmail: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

transferSchema.pre('save', function(next) {
  if (this.isModified('beneficiaryName') || this.isModified('description')) {
    this.beneficiaryName = encrypt(this.beneficiaryName);
    this.description = encrypt(this.description);
  }
  next();
});

const encrypt = (text) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (text) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const Transfer = mongoose.model('Transfer', transferSchema);
export default Transfer;
