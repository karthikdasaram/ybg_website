const Trainer = require('../models/Trainer');
const Member = require('../models/Member');
const User = require('../models/User');

const getTrainers = async (req, res, next) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.json({ count: trainers.length, trainers });
  } catch (err) {
    next(err);
  }
};

const getTrainerById = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    let assignedMembers = [];
    if (req.user && req.user.role === 'admin') {
      assignedMembers = await Member.find({ assignedTrainer: trainer._id }).populate(
        'user',
        'name email'
      );
    }

    res.json({ trainer, assignedMembers });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/trainers/me/profile  (logged-in trainer's own record)
const getMyTrainerProfile = async (req, res, next) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user._id });
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });
    res.json({ trainer });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/trainers/me/members  (members assigned to the logged-in trainer)
const getMyAssignedMembers = async (req, res, next) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user._id });
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });

    const members = await Member.find({ assignedTrainer: trainer._id })
      .populate('user', 'name email')
      .populate('plan', 'name');

    res.json({ count: members.length, members });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/trainers  (admin adds a trainer; optionally creates their login account)
const createTrainer = async (req, res, next) => {
  try {
    const { name, email, phone, specialization, experienceYears, bio, password, createLogin } = req.body;
    if (!name) return res.status(400).json({ message: 'Trainer name is required' });

    let userId = null;
    if (createLogin) {
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required to create a trainer login' });
      }
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ message: 'A user with this email already exists' });

      const user = await User.create({ name, email, password, role: 'trainer' });
      userId = user._id;
    }

    const trainer = await Trainer.create({
      user: userId,
      name,
      email,
      phone,
      specialization,
      experienceYears,
      bio
    });
    res.status(201).json({ message: 'Trainer added', trainer });
  } catch (err) {
    next(err);
  }
};

const updateTrainer = async (req, res, next) => {
  try {
    const { name, email, phone, specialization, experienceYears, bio, isActive } = req.body;
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, specialization, experienceYears, bio, isActive },
      { new: true, runValidators: true }
    );
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    // Keep the linked login account's name/email in sync, if one exists
    if (trainer.user && (name !== undefined || email !== undefined)) {
      const user = await User.findById(trainer.user);
      if (user) {
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        await user.save();
      }
    }

    res.json({ message: 'Trainer updated', trainer });
  } catch (err) {
    next(err);
  }
};

const deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    // Unassign this trainer from any members
    await Member.updateMany({ assignedTrainer: trainer._id }, { assignedTrainer: null });

    // Remove their login account, if one exists
    if (trainer.user) await User.findByIdAndDelete(trainer.user);

    res.json({ message: 'Trainer deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTrainers,
  getTrainerById,
  getMyTrainerProfile,
  getMyAssignedMembers,
  createTrainer,
  updateTrainer,
  deleteTrainer
};