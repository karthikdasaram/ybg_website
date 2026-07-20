const Progress = require('../models/Progress');
const Trainer = require('../models/Trainer');
const Member = require('../models/Member');

async function getTrainerMemberIds(userId) {
    const trainer = await Trainer.findOne({ user: userId });
    if (!trainer) return [];
    const members = await Member.find({ assignedTrainer: trainer._id }).select('_id');
    return members.map((m) => m._id.toString());
}

// @route GET /api/progress?memberId=  (admin: any, trainer: only their members)
const getProgress = async (req, res, next) => {
    try {
        const { memberId } = req.query;
        if (!memberId) return res.status(400).json({ message: 'memberId query param is required' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(memberId)) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        const records = await Progress.find({ member: memberId }).sort({ date: 1 });
        res.json({ count: records.length, progress: records });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/progress/me  (member views their own progress history)
const getMyProgress = async (req, res, next) => {
    try {
        const member = await Member.findOne({ user: req.user._id });
        if (!member) return res.status(404).json({ message: 'Member profile not found' });

        const records = await Progress.find({ member: member._id }).sort({ date: 1 });
        res.json({ count: records.length, progress: records });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/progress  (admin or trainer logs an entry for a member)
const addProgress = async (req, res, next) => {
    try {
        const { memberId, date, weightKg, heightCm, chestCm, waistCm, hipsCm, armsCm, notes } = req.body;
        if (!memberId) return res.status(400).json({ message: 'memberId is required' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(memberId)) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const record = await Progress.create({
            member: memberId,
            recordedBy: req.user._id,
            date: date || new Date(),
            weightKg,
            heightCm,
            chestCm,
            waistCm,
            hipsCm,
            armsCm,
            notes
        });
        res.status(201).json({ message: 'Progress entry recorded', progress: record });
    } catch (err) {
        next(err);
    }
};

const deleteProgress = async (req, res, next) => {
    try {
        const record = await Progress.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Progress entry not found' });

        if (req.user.role === 'trainer') {
            const allowedIds = await getTrainerMemberIds(req.user._id);
            if (!allowedIds.includes(record.member.toString())) {
                return res.status(403).json({ message: 'This member is not assigned to you' });
            }
        }

        await record.deleteOne();
        res.json({ message: 'Progress entry deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProgress, getMyProgress, addProgress, deleteProgress };