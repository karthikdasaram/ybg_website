const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }, // optional 1:1 session
    title: { type: String, required: true }, // e.g. "Personal Training Session", "Group Class"
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    startTime: { type: String, required: true }, // "HH:MM" 24hr
    endTime: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainerSchedule', scheduleSchema);