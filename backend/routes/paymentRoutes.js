const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  getMyPayments,
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, getMyPayments);

router.post('/', protect, authorize('admin'), createPayment);
router.get('/', protect, authorize('admin'), getPayments);
router.put('/:id', protect, authorize('admin'), updatePayment);
router.delete('/:id', protect, authorize('admin'), deletePayment);

module.exports = router;
