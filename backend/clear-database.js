const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

// Import models
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

async function clearDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear all collections
    console.log("Clearing Users collection...");
    await User.deleteMany({});
    console.log("✓ Users collection cleared");

    console.log("Clearing Posts collection...");
    await Post.deleteMany({});
    console.log("✓ Posts collection cleared");

    console.log("Clearing Comments collection...");
    await Comment.deleteMany({});
    console.log("✓ Comments collection cleared");

    console.log("\n Database cleared successfully!");
    console.log("All collections have been emptied.");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

// Run the function
clearDatabase();
