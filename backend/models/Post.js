const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 500,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    featuredImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
postSchema.pre("save", async function (next) {
  console.log("Pre-save hook triggered");
  console.log("isNew:", this.isNew);
  console.log("isModified title:", this.isModified("title"));
  console.log("current slug:", this.slug);
  console.log("title:", this.title);

  // Always generate slug if it doesn't exist or if title changed
  if (!this.slug || this.isModified("title")) {
    console.log("Generating new slug...");

    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");

    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = "untitled-post";
    }

    console.log("Base slug:", baseSlug);

    // Check for uniqueness and add number if needed
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingPost = await this.constructor.findOne({ slug: slug });
      if (
        !existingPost ||
        existingPost._id.toString() === this._id.toString()
      ) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log("Final slug:", slug);
    this.slug = slug;
  }
  next();
});

// Set publishedAt when status changes to published
postSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
