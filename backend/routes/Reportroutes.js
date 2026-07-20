const express = require('express');
const router = express.Router();
const {
    revenueReport,
    membershipReport,
    attendanceReport,
    paymentReport,
    trainerReport
} = require('../controllers/Reportcontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/revenue', protect, authorize('admin'), revenueReport);
router.get('/membership', protect, authorize('admin'), membershipReport);
router.get('/attendance', protect, authorize('admin'), attendanceReport);
router.get('/payments', protect, authorize('admin'), paymentReport);
router.get('/trainers', protect, authorize('admin'), trainerReport);

module.exports = router;