const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const MembershipPlan = require('../models/MembershipPlan');

// @route GET /api/reports/revenue?months=6  (revenue grouped by month)
const revenueReport = async (req, res, next) => {
    try {
        const months = Number(req.query.months) || 6;
        const since = new Date();
        since.setMonth(since.getMonth() - months + 1);
        since.setDate(1);
        since.setHours(0, 0, 0, 0);

        const payments = await Payment.find({ status: 'paid', paymentDate: { $gte: since } });

        const buckets = {};
        payments.forEach((p) => {
            const d = new Date(p.paymentDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            buckets[key] = (buckets[key] || 0) + p.amount;
        });

        const series = Object.keys(buckets)
            .sort()
            .map((key) => ({ month: key, revenue: buckets[key] }));

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        res.json({ totalRevenue, series });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/reports/membership  (breakdown by status and by plan)
const membershipReport = async (req, res, next) => {
    try {
        const total = await Member.countDocuments();
        const active = await Member.countDocuments({ membershipStatus: 'active' });
        const expired = await Member.countDocuments({ membershipStatus: 'expired' });
        const none = await Member.countDocuments({ membershipStatus: 'none' });

        const members = await Member.find({ plan: { $ne: null } }).populate('plan', 'name');
        const byPlan = {};
        members.forEach((m) => {
            const name = m.plan?.name || 'Unknown';
            byPlan[name] = (byPlan[name] || 0) + 1;
        });

        res.json({
            total,
            active,
            expired,
            none,
            byPlan: Object.entries(byPlan).map(([plan, count]) => ({ plan, count }))
        });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/reports/attendance?from=&to=  (daily present counts in a range)
const attendanceReport = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const query = {};
        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) query.date.$lte = new Date(to);
        }

        const records = await Attendance.find(query);
        const byDate = {};
        records.forEach((r) => {
            const key = new Date(r.date).toISOString().substring(0, 10);
            if (!byDate[key]) byDate[key] = { present: 0, absent: 0 };
            byDate[key][r.status] += 1;
        });

        const series = Object.keys(byDate)
            .sort()
            .map((date) => ({ date, ...byDate[date] }));

        res.json({
            totalRecords: records.length,
            totalPresent: records.filter((r) => r.status === 'present').length,
            totalAbsent: records.filter((r) => r.status === 'absent').length,
            series
        });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/reports/payments?from=&to=  (summary by status and method)
const paymentReport = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const query = {};
        if (from || to) {
            query.paymentDate = {};
            if (from) query.paymentDate.$gte = new Date(from);
            if (to) query.paymentDate.$lte = new Date(to);
        }

        const payments = await Payment.find(query);
        const byStatus = {};
        const byMethod = {};
        let totalPaid = 0;

        payments.forEach((p) => {
            byStatus[p.status] = (byStatus[p.status] || 0) + 1;
            byMethod[p.method] = (byMethod[p.method] || 0) + 1;
            if (p.status === 'paid') totalPaid += p.amount;
        });

        res.json({
            totalRecords: payments.length,
            totalPaidAmount: totalPaid,
            byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
            byMethod: Object.entries(byMethod).map(([method, count]) => ({ method, count }))
        });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/reports/trainers  (members assigned per trainer)
const trainerReport = async (req, res, next) => {
    try {
        const trainers = await Trainer.find();
        const report = await Promise.all(
            trainers.map(async (t) => {
                const memberCount = await Member.countDocuments({ assignedTrainer: t._id });
                const activeCount = await Member.countDocuments({ assignedTrainer: t._id, membershipStatus: 'active' });
                return {
                    trainerId: t._id,
                    name: t.name,
                    specialization: t.specialization,
                    totalAssignedMembers: memberCount,
                    activeAssignedMembers: activeCount
                };
            })
        );
        res.json({ trainers: report });
    } catch (err) {
        next(err);
    }
};

module.exports = { revenueReport, membershipReport, attendanceReport, paymentReport, trainerReport };