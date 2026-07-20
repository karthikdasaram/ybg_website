const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    weightKg: { type: Number },
    heightCm: { type: Number },
    bmi: { type: Number },
    chestCm: { type: Number },
    waistCm: { type: Number },
    hipsCm: { type: Number },
    armsCm: { type: Number },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Auto-calculate BMI when both weight and height are present
progressSchema.pre('validate', function (next) {
  if (this.weightKg && this.heightCm) {
    const heightM = this.heightCm / 100;
    this.bmi = Math.round((this.weightKg / (heightM * heightM)) * 10) / 10;
  }
  next();
});

module.exports = mongoose.model('Progress', progressSchema);