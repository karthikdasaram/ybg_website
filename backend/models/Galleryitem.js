const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
        url: { type: String, required: true }, // link to a hosted image/video (e.g. Cloudinary, S3, YouTube embed)
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);