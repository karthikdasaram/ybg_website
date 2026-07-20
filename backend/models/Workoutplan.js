const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        sets: { type: Number, default: 3 },
        reps: { type: String, default: '' }, // e.g. "10-12" or "AMRAP"
        notes: { type: String, default: '' }
    },
    { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin or trainer
        goal: { type: String, default: '' }, // e.g. "Weight loss", "Muscle gain"
        daysPerWeek: { type: Number, default: 3 },
        exercises: [exerciseSchema],
        notes: { type: String, default: '' },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);