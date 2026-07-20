const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  toggleActive
} = require('../controllers/planController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getPlans); // visitors/members see active plans, admin sees all
router.get('/:id', optionalAuth, getPlanById);
router.post('/', protect, authorize('admin'), createPlan);
router.put('/:id', protect, authorize('admin'), updatePlan);
router.delete('/:id', protect, authorize('admin'), deletePlan);
router.patch('/:id/toggle', protect, authorize('admin'), toggleActive);

module.exports = router;
