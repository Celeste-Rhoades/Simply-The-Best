import mongoose from "mongoose";
import Recommend from "../models/Recommend.js";
import dotenv from "dotenv";

dotenv.config();

const migrateRecommendations = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB");

    // Find all approved recommendations that were sent to someone
    const oldStyleRecs = await Recommend.find({
      recommendedTo: { $exists: true, $ne: null },
      status: "approved",
    });

    console.log(
      `Found ${oldStyleRecs.length} old-style recommendations to migrate`
    );

    let migrated = 0;
    for (const rec of oldStyleRecs) {
      // Store original sender
      const originalSender = rec.user;

      // Transfer ownership to recipient
      rec.originalRecommendedBy = originalSender;
      rec.user = rec.recommendedTo;

      await rec.save();
      migrated++;

      console.log(`✅ Migrated: ${rec.title} (now owned by recipient)`);
    }

    console.log(
      `\n🎉 Migration complete! Migrated ${migrated} recommendations`
    );
    console.log("All old recommendations now have correct ownership structure");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateRecommendations();
