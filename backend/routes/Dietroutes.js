const express = require('express');
const router = express.Router();
const {
    getDietPlans,
    getMyDietPlans,
    createDietPlan,
    updateDietPlan,
    deleteDietPlan
} = require('../controllers/Dietcontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('member'), getMyDietPlans);

router.get('/', protect, authorize('admin', 'trainer'), getDietPlans);
router.post('/', protect, authorize('admin', 'trainer'), createDietPlan);
router.put('/:id', protect, authorize('admin', 'trainer'), updateDietPlan);
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteDietPlan);

module.exports = router;