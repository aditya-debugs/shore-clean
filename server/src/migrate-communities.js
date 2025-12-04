// Migration script to create communities for existing organizations
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });

const Organization = require("./models/Organization");
const Community = require("./models/Community");
const Membership = require("./models/Membership");
const Message = require("./models/Message");
const User = require("./models/User");

const createCommunitiesForExistingOrgs = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all organizations
    const organizations = await Organization.find().populate("userId");
    console.log(`📋 Found ${organizations.length} organizations`);

    for (const org of organizations) {
      try {
        // Check if this organization already has a community
        const existingCommunity = await Community.findOne({
          organizationId: org._id,
        });

        if (existingCommunity) {
          console.log(
            `⏭️  Organization "${org.organizationName}" already has a community`
          );
          continue;
        }

        console.log(`🏗️  Creating community for "${org.organizationName}"...`);

        // Create community
        const community = new Community({
          name: `${org.organizationName}'s Community`,
          description: `Welcome to ${org.organizationName}'s community! Connect with volunteers and stay updated on our environmental initiatives.`,
          organizationId: org._id,
          adminId: org.userId,
        });

        await community.save();

        // Create admin membership
        const membership = new Membership({
          communityId: community._id,
          userId: org.userId,
          role: "admin",
          status: "active",
        });

        await membership.save();

        // Create welcome system message
        const welcomeMessage = new Message({
          communityId: community._id,
          senderId: org.userId,
          messageType: "system",
          content: {
            text: `Welcome to ${community.name}! This is the beginning of your community chat. Volunteers who join your events can connect with you here.`,
          },
        });

        await welcomeMessage.save();

        console.log(`✅ Created community for "${org.organizationName}"`);
      } catch (error) {
        console.error(
          `❌ Error creating community for "${org.organizationName}":`,
          error.message
        );
      }
    }

    console.log("🎉 Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

// Run the migration
createCommunitiesForExistingOrgs();
