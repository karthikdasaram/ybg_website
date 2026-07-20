const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g. "Breakfast"
        items: { type: String, default: '' }, // free-text list of foods
        calories: { type: Number, default: 0 }
    },
    { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        goal: { type: String, default: '' },
        dailyCalorieTarget: { type: Number, default: 0 },
        meals: [mealSchema],
        notes: { type: String, default: '' },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('DietPlan', dietPlanSchema);