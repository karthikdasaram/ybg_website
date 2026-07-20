require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const MembershipPlan = require('../models/MembershipPlan');

const seedPlans = async () => {
  await connectDB();

  const samplePlans = [
    {
      name: "Basic Monthly",
      durationMonths: 1,
      price: 29.99,
      benefits: ["Access to all gym equipment", "Locker room access", "1 free fitness assessment"],
      description: "A great starter plan for those looking to get into a fitness routine without a long-term commitment.",
      isActive: true
    },
    {
      name: "Quarterly Pro",
      durationMonths: 3,
      price: 79.99,
      benefits: ["Access to all gym equipment", "Locker room access", "Group fitness classes included", "1 personal training session/month"],
      description: "Our most popular plan. Save money by committing for 3 months and get access to our premium group classes.",
      isActive: true
    },
    {
      name: "Annual Elite",
      durationMonths: 12,
      price: 299.99,
      benefits: ["24/7 Access to all gym equipment", "Locker room access with private locker", "Unlimited group fitness classes", "Guest pass (2/month)", "Free smoothie/shake per visit"],
      description: "For the dedicated athlete. Get the best value and exclusive perks with our annual membership.",
      isActive: true
    }
  ];

  for (const plan of samplePlans) {
    const existing = await MembershipPlan.findOne({ name: plan.name });
    if (!existing) {
      await MembershipPlan.create(plan);
      console.log(`Created plan: ${plan.name}`);
    } else {
      console.log(`Plan already exists: ${plan.name}`);
    }
  }

  await mongoose.connection.close();
  process.exit(0);
};

seedPlans().catch((err) => {
  console.error('Seeding plans failed:', err.message);
  process.exit(1);
});
