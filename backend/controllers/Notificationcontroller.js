const Notification = require('../models/Notification');
const Member = require('../models/Member');
const Payment = require('../models/Payment');

// @route GET /api/notifications/me  (member: sees "all" audience + their own scoped notifications)
const getMyNotifications = async (req, res, next) => {
    try {
        const member = await Member.findOne({ user: req.user._id });
        if (!member) return res.status(404).json({ message: 'Member profile not found' });

        const notifications = await Notification.find({
            $or: [{ audience: 'all' }, { audience: 'member', member: member._id }]
        }).sort({ createdAt: -1 });

        res.json({ count: notifications.length, notifications });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/notifications  (admin - all announcements/reminders sent)
const getAllNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find()
            .populate({ path: 'member', populate: { path: 'user', select: 'name' } })
            .sort({ createdAt: -1 });
        res.json({ count: notifications.length, notifications });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/notifications  (admin creates an announcement or targeted reminder)
const createNotification = async (req, res, next) => {
    try {
        const { title, message, type, audience, memberId } = req.body;
        if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });

        const notification = await Notification.create({
            title,
            message,
            type: type || 'announcement',
            audience: audience || 'all',
            member: audience === 'member' ? memberId : null,
            createdBy: req.user._id
        });
        res.status(201).json({ message: 'Notification created', notification });
    } catch (err) {
        next(err);
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/notifications/reminders  (admin - members whose membership expires within 7 days,
// plus members with pending payments; computed live, not stored)
const getReminderCandidates = async (req, res, next) => {
    try {
        const in7Days = new Date();
        in7Days.setDate(in7Days.getDate() + 7);

        const expiringSoon = await Member.find({
            membershipStatus: 'active',
            membershipEnd: { $lte: in7Days, $gte: new Date() }
        }).populate('user', 'name email');

        const pendingPayments = await Payment.find({ status: 'pending' })
            .populate({ path: 'member', populate: { path: 'user', select: 'name email' } });

        res.json({
            expiringSoon: expiringSoon.map((m) => ({
                memberId: m._id,
                name: m.user?.name,
                email: m.user?.email,
                membershipEnd: m.membershipEnd
            })),
            pendingPayments: pendingPayments.map((p) => ({
                memberId: p.member?._id,
                name: p.member?.user?.name,
                email: p.member?.user?.email,
                amount: p.amount,
                receiptNo: p.receiptNo
            }))
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyNotifications,
    getAllNotifications,
    createNotification,
    deleteNotification,
    getReminderCandidates
};