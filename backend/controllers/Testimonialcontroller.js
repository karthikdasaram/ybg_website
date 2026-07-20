const Testimonial = require('../models/Testimonial');
const Member = require('../models/Member');

// @route GET /api/testimonials  (public - only approved ones)
const getApprovedTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
        res.json({ count: testimonials.length, testimonials });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/testimonials/all  (admin - includes unapproved)
const getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json({ count: testimonials.length, testimonials });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/testimonials  (logged-in member submits a review)
const submitTestimonial = async (req, res, next) => {
    try {
        const { message, rating } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const member = await Member.findOne({ user: req.user._id }).populate('user', 'name');
        if (!member) return res.status(404).json({ message: 'Member profile not found' });

        const testimonial = await Testimonial.create({
            member: member._id,
            name: member.user.name,
            message,
            rating: rating || 5
        });
        res.status(201).json({ message: 'Testimonial submitted, pending admin approval', testimonial });
    } catch (err) {
        next(err);
    }
};

// @route PATCH /api/testimonials/:id/approve  (admin)
const approveTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

        testimonial.isApproved = !testimonial.isApproved;
        await testimonial.save();
        res.json({ message: `Testimonial ${testimonial.isApproved ? 'approved' : 'unapproved'}`, testimonial });
    } catch (err) {
        next(err);
    }
};

const deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
        res.json({ message: 'Testimonial deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getApprovedTestimonials,
    getAllTestimonials,
    submitTestimonial,
    approveTestimonial,
    deleteTestimonial
};