const Member = require('../models/Member');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const crypto = require('crypto');

// @route GET /api/members  (admin) - list + search
const getMembers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status) query.membershipStatus = status;

    let members = await Member.find(query)
      .populate('user', 'name email isActive')
      .populate('plan', 'name durationMonths price')
      .populate('assignedTrainer', 'name specialization')
      .sort({ createdAt: -1 });

    // Refresh membership statuses on the fly and persist any changes
    for (const m of members) {
      const before = m.membershipStatus;
      m.refreshStatus();
      if (before !== m.membershipStatus) await m.save();
    }

    if (search) {
      const s = search.toLowerCase();
      members = members.filter(
        (m) =>
          m.user?.name?.toLowerCase().includes(s) ||
          m.user?.email?.toLowerCase().includes(s) ||
          m.phone?.toLowerCase().includes(s)
      );
    }

    res.json({ count: members.length, members });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/members/:id
const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user', 'name email isActive')
      .populate('plan')
      .populate('assignedTrainer', 'name specialization phone');

    if (!member) return res.status(404).json({ message: 'Member not found' });
    member.refreshStatus();
    res.json({ member });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/members/me  (logged-in member's own profile)
const getMyProfile = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id })
      .populate('user', 'name email')
      .populate('plan')
      .populate('assignedTrainer', 'name specialization phone');

    if (!member) return res.status(404).json({ message: 'Member profile not found' });
    member.refreshStatus();
    if (!member.checkinToken) member.checkinToken = crypto.randomBytes(16).toString('hex'); // backfill for members created before QR check-in existed
    await member.save();
    res.json({ member });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/members  (admin creates a member incl. login account)
const createMember = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, dob, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'A user with this email already exists' });

    const user = await User.create({ name, email, password, role: 'member' });
    const member = await Member.create({ user: user._id, phone, address, dob, gender });

    const populated = await member.populate('user', 'name email');
    res.status(201).json({ message: 'Member created', member: populated });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/members/:id  (admin edits profile fields)
const updateMember = async (req, res, next) => {
  try {
    const { phone, address, dob, gender, assignedTrainer, notes, name, email, isActive } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (phone !== undefined) member.phone = phone;
    if (address !== undefined) member.address = address;
    if (dob !== undefined) member.dob = dob;
    if (gender !== undefined) member.gender = gender;
    if (assignedTrainer !== undefined) member.assignedTrainer = assignedTrainer || null;
    if (notes !== undefined) member.notes = notes;
    await member.save();

    if (name !== undefined || email !== undefined || isActive !== undefined) {
      const user = await User.findById(member.user);
      if (user) {
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (isActive !== undefined) user.isActive = isActive;
        await user.save();
      }
    }

    const populated = await Member.findById(member._id).populate('user', 'name email isActive');
    res.json({ message: 'Member updated', member: populated });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/members/:id
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await User.findByIdAndDelete(member.user);
    await member.deleteOne();

    res.json({ message: 'Member deleted' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/members/:id/assign-plan  (admin assigns/renews a membership plan)
const assignPlan = async (req, res, next) => {
  try {
    const { planId, startDate } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const plan = await MembershipPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Membership plan not found' });

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);

    member.plan = plan._id;
    member.membershipStart = start;
    member.membershipEnd = end;
    member.refreshStatus();
    await member.save();

    const populated = await Member.findById(member._id)
      .populate('user', 'name email')
      .populate('plan');

    res.json({ message: 'Membership plan assigned', member: populated });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/members/:id/regenerate-token  (admin - invalidates the old QR code and issues a new one)
const regenerateCheckinToken = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.checkinToken = crypto.randomBytes(16).toString('hex');
    await member.save();

    res.json({ message: 'QR check-in code regenerated. The old code will no longer work.', checkinToken: member.checkinToken });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  getMyProfile,
  createMember,
  updateMember,
  deleteMember,
  assignPlan,
  regenerateCheckinToken
};