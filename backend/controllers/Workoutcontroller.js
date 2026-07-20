const WorkoutPlan = require('../models/Workoutplan');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');

// Helper: if the caller is a trainer, restrict to their assigned members
async function getTrainerMemberIds(userId) {
    const trainer = await Trainer.findOne({ user: userId });
    if (!trainer) return [];
    const members = await Member.find({ assignedTrainer: trainer._id }).select('_id');
    return members.map((m) => m._id.toString());
}

// @route GET /api/workouts?memberId=  (admin: all/filtered, trainer: only their members)
const getWorkoutPlans = async (req, res, next) => {
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

        const plans = await WorkoutPlan.find(query)
            .populate({ path: 'member', populate: { path: 'user', select: 'name email' } })
            .sort({ createdAt: -1 });
        res.json({ count: plans.length, workoutPlans: plans });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/workouts/me  (member views their own workout plans)
const getMyWorkoutPlans = async (req, res, next) => {
    try {
        const member = await Member.findOne({ user: req.user._id });
        if (!member) return res.status(404).json({ message: 'Member profile not found' });

        const plans = await WorkoutPlan.find({ member: member._id, isActive: true }).sort({ createdAt: -1 });
        res.json({ count: plans.length, workoutPlans: plans });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/workouts  (admin or trainer, trainer limited to their own members)
const createWorkoutPlan = async (req, res, next) => {
    try {
        const { memberId, title, goal, daysPerWeek, exercises, notes } = req.body;
        if (!memberId || !title) return res.status(400).json({ message: 'memberId and title are required' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(memberId)) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const plan = await WorkoutPlan.create({
            member: memberId,
            createdBy: req.user._id,
            title,
            goal,
            daysPerWeek,
            exercises: exercises || [],
            notes
        });
        res.status(201).json({ message: 'Workout plan created', workoutPlan: plan });
    } catch (err) {
        next(err);
    }
};

const updateWorkoutPlan = async (req, res, next) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Workout plan not found' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(plan.member.toString())) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        const { title, goal, daysPerWeek, exercises, notes, isActive } = req.body;
        if (title !== undefined) plan.title = title;
        if (goal !== undefined) plan.goal = goal;
        if (daysPerWeek !== undefined) plan.daysPerWeek = daysPerWeek;
        if (exercises !== undefined) plan.exercises = exercises;
        if (notes !== undefined) plan.notes = notes;
        if (isActive !== undefined) plan.isActive = isActive;
        await plan.save();

        res.json({ message: 'Workout plan updated', workoutPlan: plan });
    } catch (err) {
        next(err);
    }
};

const deleteWorkoutPlan = async (req, res, next) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Workout plan not found' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(plan.member.toString())) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        await plan.deleteOne();
        res.json({ message: 'Workout plan deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getWorkoutPlans,
    getMyWorkoutPlans,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
};