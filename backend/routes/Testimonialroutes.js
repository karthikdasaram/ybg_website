const express = require('express');
const router = express.Router();
const {
    getApprovedTestimonials,
    getAllTestimonials,
    submitTestimonial,
    approveTestimonial,
    deleteTestimonial
} = require('../controllers/Testimonialcontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getApprovedTestimonials); // public
router.get('/all', protect, authorize('admin'), getAllTestimonials);
router.post('/', protect, authorize('member'), submitTestimonial);
router.patch('/:id/approve', protect, authorize('admin'), approveTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

module.exports = router;