const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
    {
        member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
        name: { type: String, required: true }, // display name (in case submitted by a visitor)
        message: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, default: 5 },
        isApproved: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);