const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Get all published posts (public)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const query = { status: "published" };

    // Add filters
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query)
      .populate("author", "username firstName lastName avatar")
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single post by ID (authenticated - for editing)
router.get("/by-id/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username firstName lastName avatar bio"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author or admin
    if (
      post.author._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single post by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("author", "username firstName lastName avatar bio")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username firstName lastName avatar",
        },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new post (authenticated)
router.post("/", auth, async (req, res) => {
  try {
    console.log("Create post request received");
    console.log("User:", req.user);
    console.log("Request body:", req.body);

    const { title, content, excerpt, tags, category, featuredImage, status } =
      req.body;

    const post = new Post({
      title,
      content,
      excerpt,
      tags: tags || [],
      category,
      featuredImage,
      status: status || "draft",
      author: req.user._id,
    });

    console.log("Post object before save:", post);

    await post.save();
    await post.populate("author", "username firstName lastName avatar");

    console.log("Post saved successfully:", post);

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error during post creation" });
  }
});

// Update post (authenticated - author or admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is author or admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const { title, content, excerpt, tags, category, featuredImage, status } =
      req.body;

    console.log("Update post request received");
    console.log("Post ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("Status to update:", status);

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, excerpt, tags, category, featuredImage, status },
      { new: true, runValidators: true }
    ).populate("author", "username firstName lastName avatar");

    console.log("Updated post:", updatedPost);

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Server error during post update" });
  }
});

// Delete post (authenticated - author or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is author or admin
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: req.params.id });

    // Delete post
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error during post deletion" });
  }
});

// Like/Unlike post (authenticated)
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's posts (authenticated)
router.get("/user/posts", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { author: req.user._id };

    console.log("Get user posts request");
    console.log("User ID:", req.user._id);
    console.log("Status filter:", status);

    if (status) query.status = status;

    console.log("Query:", query);

    const posts = await Post.find(query)
      .populate("author", "username firstName lastName avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    console.log(
      "Found posts:",
      posts.map((p) => ({ id: p._id, title: p.title, status: p.status }))
    );

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Ensure the route for fetching a single post is implemented correctly
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author")
      .populate("comments");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a route to fetch a post by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("author")
      .populate("comments");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
