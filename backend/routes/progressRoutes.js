const express = require('express');
const router = express.Router();
const { getProgress, getMyProgress, addProgress, deleteProgress } = require('../controllers/Progresscontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('member'), getMyProgress);

router.get('/', protect, authorize('admin', 'trainer'), getProgress);
router.post('/', protect, authorize('admin', 'trainer'), addProgress);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteProgress);

module.exports = router;