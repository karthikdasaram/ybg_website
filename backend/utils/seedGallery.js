require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const GalleryItem = require('../models/Galleryitem');

const seedGallery = async () => {
  await connectDB();

  const sampleItems = [
    {
      title: "Premium Weights",
      mediaType: "image",
      url: "images/gallery1.png"
    },
    {
      title: "Cardio Zone",
      mediaType: "image",
      url: "images/gallery2.png"
    }
  ];

  for (const item of sampleItems) {
    const existing = await GalleryItem.findOne({ title: item.title });
    if (!existing) {
      await GalleryItem.create(item);
      console.log(`Created gallery item: ${item.title}`);
    } else {
      console.log(`Gallery item already exists: ${item.title}`);
    }
  }

  await mongoose.connection.close();
  process.exit(0);
};

seedGallery().catch((err) => {
  console.error('Seeding gallery failed:', err.message);
  process.exit(1);
});
