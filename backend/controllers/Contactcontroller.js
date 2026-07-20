const ContactMessage = require('../models/Contactmessage');

// @route POST /api/contact  (public - visitor submits an enquiry)
const submitEnquiry = async (req, res, next) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email and message are required' });
        }

        const enquiry = await ContactMessage.create({ name, email, phone, message });
        res.status(201).json({ message: 'Thanks! Your message has been received.', enquiry });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/contact  (admin - list all enquiries)
const getMessages = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const messages = await ContactMessage.find(query).sort({ createdAt: -1 });
        res.json({ count: messages.length, messages });
    } catch (err) {
        next(err);
    }
};

// @route PUT /api/contact/:id  (admin - update status, e.g. mark as read/resolved)
const updateMessageStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const message = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.json({ message: 'Status updated', enquiry: message });
    } catch (err) {
        next(err);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        const message = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.json({ message: 'Message deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { submitEnquiry, getMessages, updateMessageStatus, deleteMessage };