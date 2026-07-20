const DietPlan = require('../models/Dietplan');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');

async function getTrainerMemberIds(userId) {
    const trainer = await Trainer.findOne({ user: userId });
    if (!trainer) return [];
    const members = await Member.find({ assignedTrainer: trainer._id }).select('_id');
    return members.map((m) => m._id.toString());
}

const getDietPlans = async (req, res, next) => {
    try {
        const { memberId } = req.query;
        const query = {};
        if (memberId) query.member = memberId;

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            query.member = memberId ? memberId : { $in: allowedIds };
            if (memberId && !allowedIds.includes(memberId)) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        const plans = await DietPlan.find(query)
            .populate({ path: 'member', populate: { path: 'user', select: 'name email' } })
            .sort({ createdAt: -1 });
        res.json({ count: plans.length, dietPlans: plans });
    } catch (err) {
        next(err);
    }
};

const getMyDietPlans = async (req, res, next) => {
    try {
        const member = await Member.findOne({ user: req.user._id });
        if (!member) return res.status(404).json({ message: 'Member profile not found' });

        const plans = await DietPlan.find({ member: member._id, isActive: true }).sort({ createdAt: -1 });
        res.json({ count: plans.length, dietPlans: plans });
    } catch (err) {
        next(err);
    }
};

const createDietPlan = async (req, res, next) => {
    try {
        const { memberId, title, goal, dailyCalorieTarget, meals, notes } = req.body;
        if (!memberId || !title) return res.status(400).json({ message: 'memberId and title are required' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(memberId)) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const plan = await DietPlan.create({
            member: memberId,
            createdBy: req.user._id,
            title,
            goal,
            dailyCalorieTarget,
            meals: meals || [],
            notes
        });
        res.status(201).json({ message: 'Diet plan created', dietPlan: plan });
    } catch (err) {
        next(err);
    }
};

const updateDietPlan = async (req, res, next) => {
    try {
        const plan = await DietPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Diet plan not found' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(plan.member.toString())) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        const { title, goal, dailyCalorieTarget, meals, notes, isActive } = req.body;
        if (title !== undefined) plan.title = title;
        if (goal !== undefined) plan.goal = goal;
        if (dailyCalorieTarget !== undefined) plan.dailyCalorieTarget = dailyCalorieTarget;
        if (meals !== undefined) plan.meals = meals;
        if (notes !== undefined) plan.notes = notes;
        if (isActive !== undefined) plan.isActive = isActive;
        await plan.save();

        res.json({ message: 'Diet plan updated', dietPlan: plan });
    } catch (err) {
        next(err);
    }
};

const deleteDietPlan = async (req, res, next) => {
    try {
        const plan = await DietPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Diet plan not found' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(plan.member.toString())) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        await plan.deleteOne();
        res.json({ message: 'Diet plan deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getDietPlans, getMyDietPlans, createDietPlan, updateDietPlan, deleteDietPlan };