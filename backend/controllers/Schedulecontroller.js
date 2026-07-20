const TrainerSchedule = require('../models/Trainerschedule');
const Trainer = require('../models/Trainer');

// @route GET /api/schedules?trainerId=  (admin: all/filtered, trainer: only their own)
const getSchedules = async (req, res, next) => {
    try {
        const query = {};

        if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ user: req.user._id });
            if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });
            query.trainer = trainer._id;
        } else if (req.query.trainerId) {
            query.trainer = req.query.trainerId;
        }

        const schedules = await TrainerSchedule.find(query)
            .populate('trainer', 'name specialization')
            .populate({ path: 'member', populate: { path: 'user', select: 'name' } })
            .sort({ dayOfWeek: 1, startTime: 1 });

        res.json({ count: schedules.length, schedules });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/schedules  (admin for any trainer, trainer for themselves)
const createSchedule = async (req, res, next) => {
    try {
        const { trainerId, memberId, title, dayOfWeek, startTime, endTime, notes } = req.body;

        let resolvedTrainerId = trainerId;
        if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ user: req.user._id });
            if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });
            resolvedTrainerId = trainer._id;
        }

        if (!resolvedTrainerId || !title || !dayOfWeek || !startTime || !endTime) {
            return res.status(400).json({ message: 'trainerId, title, dayOfWeek, startTime and endTime are required' });
        }

        const schedule = await TrainerSchedule.create({
            trainer: resolvedTrainerId,
            member: memberId || null,
            title,
            dayOfWeek,
            startTime,
            endTime,
            notes
        });
        res.status(201).json({ message: 'Schedule entry created', schedule });
    } catch (err) {
        next(err);
    }
};

const updateSchedule = async (req, res, next) => {
    try {
        const schedule = await TrainerSchedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule entry not found' });

        if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ user: req.user._id });
            if (!trainer || schedule.trainer.toString() !== trainer._id.toString()) {
                return res.status(403).json({ message: 'This schedule entry does not belong to you' });
            }
        }

        const { title, dayOfWeek, startTime, endTime, notes, memberId } = req.body;
        if (title !== undefined) schedule.title = title;
        if (dayOfWeek !== undefined) schedule.dayOfWeek = dayOfWeek;
        if (startTime !== undefined) schedule.startTime = startTime;
        if (endTime !== undefined) schedule.endTime = endTime;
        if (notes !== undefined) schedule.notes = notes;
        if (memberId !== undefined) schedule.member = memberId || null;
        await schedule.save();

        res.json({ message: 'Schedule entry updated', schedule });
    } catch (err) {
        next(err);
    }
};

const deleteSchedule = async (req, res, next) => {
    try {
        const schedule = await TrainerSchedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule entry not found' });

        if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ user: req.user._id });
            if (!trainer || schedule.trainer.toString() !== trainer._id.toString()) {
                return res.status(403).json({ message: 'This schedule entry does not belong to you' });
            }
        }

        await schedule.deleteOne();
        res.json({ message: 'Schedule entry deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };