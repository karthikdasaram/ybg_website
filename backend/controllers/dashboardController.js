const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

const getStats = async (req, res, next) => {
  try {
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ membershipStatus: 'active' });
    const expiredMembers = await Member.countDocuments({ membershipStatus: 'expired' });
    const totalTrainers = await Trainer.countDocuments();
    const totalPlans = await MembershipPlan.countDocuments();

    const payments = await Payment.find({ status: 'paid' });
    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({ date: today, status: 'present' });

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers,
      totalTrainers,
      totalPlans,
      revenue,
      pendingPayments,
      todayAttendance
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
