const MembershipPlan = require('../models/MembershipPlan');

// Public/list - visitors and members can view active plans; admin sees all
const getPlans = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const query = isAdmin ? {} : { isActive: true };
    const plans = await MembershipPlan.find(query).sort({ price: 1 });
    res.json({ count: plans.length, plans });
  } catch (err) {
    next(err);
  }
};

const getPlanById = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const { name, durationMonths, price, benefits, description } = req.body;
    if (!name || !durationMonths || price === undefined) {
      return res.status(400).json({ message: 'Name, durationMonths and price are required' });
    }

    const plan = await MembershipPlan.create({
      name,
      durationMonths,
      price,
      benefits: benefits || [],
      description
    });
    res.status(201).json({ message: 'Plan created', plan });
  } catch (err) {
    next(err);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan updated', plan });
  } catch (err) {
    next(err);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    next(err);
  }
};

const toggleActive = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    plan.isActive = !plan.isActive;
    await plan.save();
    res.json({ message: `Plan ${plan.isActive ? 'activated' : 'deactivated'}`, plan });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlans, getPlanById, createPlan, updatePlan, deletePlan, toggleActive };
