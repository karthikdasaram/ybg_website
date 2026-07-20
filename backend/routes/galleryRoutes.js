const express = require('express');
const router = express.Router();
const { getGallery, addGalleryItem, deleteGalleryItem } = require('../controllers/Gallerycontroller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getGallery); // fully public

router.post('/', protect, authorize('admin'), addGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;