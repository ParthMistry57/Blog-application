const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const router = express.Router();

// Clear all data from database
router.delete("/clear-database", async (req, res) => {
  try {
    // Clear all collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    res.json({
      success: true,
      message: "Database cleared successfully",
      clearedCollections: ["users", "posts", "comments"],
    });
  } catch (error) {
    console.error("Error clearing database:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear database",
      error: error.message,
    });
  }
});

// Get database statistics
router.get("/stats", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const commentCount = await Comment.countDocuments();

    res.json({
      success: true,
      stats: {
        users: userCount,
        posts: postCount,
        comments: commentCount,
        total: userCount + postCount + commentCount,
      },
    });
  } catch (error) {
    console.error("Error getting database stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get database statistics",
      error: error.message,
    });
  }
});

module.exports = router;
