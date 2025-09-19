
'use server';

import { seedDatabase as seed } from '@/app/admin/actions';

export const seedDatabase = async () => {
  console.log("🚀 Starting database seed...");
  try {
    await seed();
    console.log("🎉 Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0); // Exit cleanly after seeding
  }
};

// 👇 actually call the function when you run `npm run seed`
seedDatabase();
