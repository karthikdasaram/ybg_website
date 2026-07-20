const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    joinDate: { type: Date, default: Date.now },

    // Current membership
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', default: null },
    membershipStart: { type: Date, default: null },
    membershipEnd: { type: Date, default: null },
    membershipStatus: { type: String, enum: ['none', 'active', 'expired'], default: 'none' },

    assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', default: null },

    // Random, unguessable token encoded into this member's personal QR code.
    // The kiosk uses this (not the Mongo _id) to identify who's checking in/out,
    // since it never requires the member to log in on a shared kiosk device.
    checkinToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomBytes(16).toString('hex')
    },

    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Recompute membership status based on end date
memberSchema.methods.refreshStatus = function () {
  if (!this.membershipEnd) {
    this.membershipStatus = 'none';
  } else if (new Date(this.membershipEnd) >= new Date()) {
    this.membershipStatus = 'active';
  } else {
    this.membershipStatus = 'expired';
  }
  return this.membershipStatus;
};

module.exports = mongoose.model('Member', memberSchema);