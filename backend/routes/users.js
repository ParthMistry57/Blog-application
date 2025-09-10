const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Get all users (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manually load posts authored by this user. Cover both common field names used in Post schema.
    const posts = await Post.find({
      $or: [{ author: user._id }, { user: user._id }],
    })
      .select("title slug excerpt publishedAt views likes")
      .sort({ publishedAt: -1 })
      .limit(10);

    // Attach posts to a plain object version of user and return
    const userObj = user.toObject ? user.toObject() : user;
    userObj.posts = posts;

    res.json(userObj);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user (authenticated - own profile or admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const { firstName, lastName, bio, avatar } = req.body;

    // Check if user is updating their own profile or is admin
    if (
      req.params.id !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, bio, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
});

// Delete user (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow admin to delete themselves
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    // Delete user's posts and comments
    await Post.deleteMany({ author: req.params.id });
    await Comment.deleteMany({ author: req.params.id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error during user deletion" });
  }
});

// Update user role (admin only)
router.put("/:id/role", adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Don't allow changing own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error during role update" });
  }
});

// Toggle user active status (admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    // Don't allow deactivating own account
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error during status update" });
  }
});

module.exports = router;
