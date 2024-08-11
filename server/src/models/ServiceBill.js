import mongoose from 'mongoose';

const serviceBillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceType: {
    type: String,
    enum: ['electricidad', 'agua'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const ServiceBill = mongoose.model('ServiceBill', serviceBillSchema);
export default ServiceBill;