const GalleryItem = require('../models/Galleryitem');

// @route GET /api/gallery  (public)
const getGallery = async (req, res, next) => {
    try {
        const items = await GalleryItem.find().sort({ createdAt: -1 });
        res.json({ count: items.length, gallery: items });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/gallery  (admin)
const addGalleryItem = async (req, res, next) => {
    try {
        const { title, mediaType, url } = req.body;
        if (!url) return res.status(400).json({ message: 'A media URL is required' });

        const item = await GalleryItem.create({
            title,
            mediaType: mediaType || 'image',
            url,
            uploadedBy: req.user._id
        });
        res.status(201).json({ message: 'Gallery item added', item });
    } catch (err) {
        next(err);
    }
};

// @route DELETE /api/gallery/:id  (admin)
const deleteGalleryItem = async (req, res, next) => {
    try {
        const item = await GalleryItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Gallery item not found' });
        res.json({ message: 'Gallery item deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getGallery, addGalleryItem, deleteGalleryItem };