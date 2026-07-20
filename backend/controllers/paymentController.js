const Payment = require('../models/Payment');
const Member = require('../models/Member');

// @route POST /api/payments  (admin records a payment)
const createPayment = async (req, res, next) => {
  try {
    const { memberId, planId, amount, method, status, paymentDate, notes } = req.body;
    if (!memberId || amount === undefined) {
      return res.status(400).json({ message: 'memberId and amount are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const payment = await Payment.create({
      member: memberId,
      plan: planId || member.plan || null,
      amount,
      method,
      status,
      paymentDate,
      notes
    });

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/payments  (admin - list all, with optional filters)
const getPayments = async (req, res, next) => {
  try {
    const { memberId, status, from, to } = req.query;
    const query = {};
    if (memberId) query.member = memberId;
    if (status) query.status = status;
    if (from || to) {
      query.paymentDate = {};
      if (from) query.paymentDate.$gte = new Date(from);
      if (to) query.paymentDate.$lte = new Date(to);
    }

    const payments = await Payment.find(query)
      .populate({ path: 'member', populate: { path: 'user', select: 'name email' } })
      .populate('plan', 'name')
      .sort({ paymentDate: -1 });

    const totalRevenue = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ count: payments.length, totalRevenue, payments });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/payments/me  (member views own payment history)
const getMyPayments = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member profile not found' });

    const payments = await Payment.find({ member: member._id })
      .populate('plan', 'name')
      .sort({ paymentDate: -1 });

    res.json({ count: payments.length, payments });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/payments/:id
const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment updated', payment });
  } catch (err) {
    next(err);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getPayments, getMyPayments, updatePayment, deletePayment };
