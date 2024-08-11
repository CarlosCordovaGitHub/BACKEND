// /src/models/Account.js
import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountType: {
    type: String,
    enum: ['savings', 'checking'],
    required: true,
  },
  balance: {
    type: Number,
    default: 100,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20,
  }
}, {
  timestamps: true,
});

const Account = mongoose.model('Account', accountSchema);
export default Account;
