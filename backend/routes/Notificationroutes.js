const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    getAllNotifications,
    createNotification,
    deleteNotification,
    getReminderCandidates
} = require('../controllers/Notificationcontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('member'), getMyNotifications);
router.get('/reminders', protect, authorize('admin'), getReminderCandidates);

router.get('/', protect, authorize('admin'), getAllNotifications);
router.post('/', protect, authorize('admin'), createNotification);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;