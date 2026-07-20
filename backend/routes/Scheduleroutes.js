const express = require('express');
const router = express.Router();
const {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
} = require('../controllers/Schedulecontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'trainer'), getSchedules);
router.post('/', protect, authorize('admin', 'trainer'), createSchedule);
router.put('/:id', protect, authorize('admin', 'trainer'), updateSchedule);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteSchedule);

module.exports = router;