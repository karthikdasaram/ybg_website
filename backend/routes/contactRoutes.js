const express = require('express');
const router = express.Router();
const {
    submitEnquiry,
    getMessages,
    updateMessageStatus,
    deleteMessage
} = require('../controllers/Contactcontroller');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitEnquiry); // public

router.get('/', protect, authorize('admin'), getMessages);
router.put('/:id', protect, authorize('admin'), updateMessageStatus);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;