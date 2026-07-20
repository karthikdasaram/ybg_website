const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  getMyProfile,
  createMember,
  updateMember,
  deleteMember,
  assignPlan,
  regenerateCheckinToken
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

// Member self-service (must come before /:id to avoid route collision)
router.get('/me', protect, getMyProfile);

// Admin only
router.get('/', protect, authorize('admin'), getMembers);
router.post('/', protect, authorize('admin'), createMember);
router.get('/:id', protect, authorize('admin'), getMemberById);
router.put('/:id', protect, authorize('admin'), updateMember);
router.delete('/:id', protect, authorize('admin'), deleteMember);
router.post('/:id/assign-plan', protect, authorize('admin'), assignPlan);
router.post('/:id/regenerate-token', protect, authorize('admin'), regenerateCheckinToken);

module.exports = router;