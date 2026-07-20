const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['announcement', 'membership_reminder', 'payment_reminder'],
            default: 'announcement'
        },
        // If audience is 'all', it shows to every member. Otherwise scoped to one member.
        audience: { type: String, enum: ['all', 'member'], default: 'all' },
        member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);