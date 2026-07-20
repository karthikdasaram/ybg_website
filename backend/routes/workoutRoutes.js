const express = require('express');
const router = express.Router();
const {
    getWorkoutPlans,
    getMyWorkoutPlans,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
} = require('../controllers/Workoutcontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('member'), getMyWorkoutPlans);

router.get('/', protect, authorize('admin', 'trainer'), getWorkoutPlans);
router.post('/', protect, authorize('admin', 'trainer'), createWorkoutPlan);
router.put('/:id', protect, authorize('admin', 'trainer'), updateWorkoutPlan);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteWorkoutPlan);

module.exports = router;