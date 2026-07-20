const express = require('express');
const router = express.Router();
const {
  getTrainers,
  getTrainerById,
  getMyTrainerProfile,
  getMyAssignedMembers,
  createTrainer,
  updateTrainer,
  deleteTrainer
} = require('../controllers/trainerController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Trainer self service (must come before / :id to avoid route collision)
router.get('/me/profile', protect, authorize('trainer'), getMyTrainerProfile);
router.get('/me/members', protect, authorize('trainer'), getMyAssignedMembers);

router.get('/', optionalAuth, getTrainers); // public - visitors and members can view trainer list
router.get('/:id', optionalAuth, getTrainerById);
router.post('/', protect, authorize('admin'), createTrainer);
router.put('/:id', protect, authorize('admin'), updateTrainer);
router.delete('/:id', protect, authorize('admin'), deleteTrainer);

module.exports = router;
