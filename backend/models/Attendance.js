const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], default: 'present' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Populated when this record came from a member self-punching in/out at the kiosk
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    source: { type: String, enum: ['admin', 'kiosk'], default: 'admin' }
  },
  { timestamps: true }
);

// Prevent duplicate attendance entries for the same member on the same day
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);