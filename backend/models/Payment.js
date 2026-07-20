const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', default: null },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'], default: 'cash' },
    status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid' },
    paymentDate: { type: Date, default: Date.now },
    receiptNo: { type: String, unique: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Auto-generate a simple receipt number before saving
paymentSchema.pre('validate', function (next) {
  if (!this.receiptNo) {
    this.receiptNo = 'RCPT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
