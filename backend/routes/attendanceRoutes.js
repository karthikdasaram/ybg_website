const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  updateAttendance,
  getMyAttendance,
  punchAttendance,
  selfPunchAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Public kiosk endpoint - no login, the QR token is the credential
router.post('/punch', punchAttendance);

// Member self-punch via phone scanning generic QR code
router.post('/self-punch', protect, selfPunchAttendance);

router.get('/me', protect, getMyAttendance);

router.post('/', protect, authorize('admin'), markAttendance);
router.get('/', protect, authorize('admin'), getAttendance);
router.put('/:id', protect, authorize('admin'), updateAttendance);

module.exports = router;