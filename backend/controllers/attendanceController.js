const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

// @route POST /api/attendance  (admin marks attendance for a member)
const markAttendance = async (req, res, next) => {
  try {
    const { memberId, date, status } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId is required' });

    const day = date ? new Date(date) : new Date();
    day.setHours(0, 0, 0, 0);

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const record = await Attendance.findOneAndUpdate(
      { member: memberId, date: day },
      { status: status || 'present', markedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Attendance marked', attendance: record });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/attendance  (admin - filter by member/date range)
const getAttendance = async (req, res, next) => {
  try {
    const { memberId, from, to } = req.query;
    const query = {};
    if (memberId) query.member = memberId;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const records = await Attendance.find(query)
      .populate({ path: 'member', populate: { path: 'user', select: 'name email' } })
      .sort({ date: -1 });

    res.json({ count: records.length, attendance: records });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/attendance/:id
const updateAttendance = async (req, res, next) => {
  try {
    const { status } = req.body;
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance updated', attendance: record });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/attendance/me  (member views own attendance)
const getMyAttendance = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id });
    if (!member) return res.status(404).json({ message: 'Member profile not found' });

    const records = await Attendance.find({ member: member._id }).sort({ date: -1 });
    res.json({ count: records.length, attendance: records });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/attendance/punch  (PUBLIC - kiosk self check-in/check-out via QR token)
// No login required: the QR token itself (scanned from the member's personal code)
// is the credential. First scan of the day = check in, second = check out.
const punchAttendance = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Missing QR token' });

    const member = await Member.findOne({ checkinToken: token }).populate('user', 'name');
    if (!member) {
      return res.status(404).json({ message: 'QR code not recognized. Please see the front desk.' });
    }

    const day = new Date();
    day.setHours(0, 0, 0, 0);
    const now = new Date();

    let record = await Attendance.findOne({ member: member._id, date: day });

    if (!record) {
      record = await Attendance.create({
        member: member._id,
        date: day,
        status: 'present',
        checkInTime: now,
        source: 'kiosk'
      });
      return res.status(201).json({
        action: 'in',
        message: `Welcome, ${member.user?.name || 'there'}!`,
        time: now,
        memberName: member.user?.name || ''
      });
    }

    if (!record.checkOutTime) {
      record.checkOutTime = now;
      await record.save();
      const minutes = record.checkInTime
        ? Math.round((now - new Date(record.checkInTime)) / 60000)
        : null;
      return res.json({
        action: 'out',
        message: `See you next time, ${member.user?.name || 'there'}!`,
        time: now,
        memberName: member.user?.name || '',
        durationMinutes: minutes
      });
    }

    // Already checked in AND out today
    return res.json({
      action: 'already-done',
      message: `${member.user?.name || 'You'} already checked in and out today.`,
      memberName: member.user?.name || '',
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/attendance/self-punch  (MEMBER - self check-in/check-out via phone scanning the gym's generic QR code)
const selfPunchAttendance = async (req, res, next) => {
  try {
    const member = await Member.findOne({ user: req.user._id }).populate('user', 'name');
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found.' });
    }

    const day = new Date();
    day.setHours(0, 0, 0, 0);
    const now = new Date();

    let record = await Attendance.findOne({ member: member._id, date: day });

    if (!record) {
      record = await Attendance.create({
        member: member._id,
        date: day,
        status: 'present',
        checkInTime: now,
        source: 'kiosk' // We can still call it kiosk or 'self'
      });
      return res.status(201).json({
        action: 'in',
        message: `Welcome, ${member.user?.name || 'there'}!`,
        time: now,
        memberName: member.user?.name || ''
      });
    }

    if (!record.checkOutTime) {
      record.checkOutTime = now;
      await record.save();
      const minutes = record.checkInTime
        ? Math.round((now - new Date(record.checkInTime)) / 60000)
        : null;
      return res.json({
        action: 'out',
        message: `See you next time, ${member.user?.name || 'there'}!`,
        time: now,
        memberName: member.user?.name || '',
        durationMinutes: minutes
      });
    }

    // Already checked in AND out today
    return res.json({
      action: 'already-done',
      message: `${member.user?.name || 'You'} already checked in and out today.`,
      memberName: member.user?.name || '',
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { markAttendance, getAttendance, updateAttendance, getMyAttendance, punchAttendance, selfPunchAttendance };