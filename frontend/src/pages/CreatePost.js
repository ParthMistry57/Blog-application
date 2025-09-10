import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  FormHelperText,
  Card,
  CardMedia,
  IconButton,
  Tooltip,
  Divider,
  Fade,
  Slide,
  Container,
  Stack,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Save,
  Publish,
  Preview,
  Image,
  Add,
  Close,
  AutoAwesome,
  Visibility,
  Edit,
  CloudUpload,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../services/api";
import "./CreatePost.css";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featuredImage: "",
    status: "draft",
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // "saving", "saved", "error"
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [contentRows, setContentRows] = useState(20); // Start with height that matches 500px

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formData.title.trim() || formData.content.trim()) {
        handleAutoSave();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData.title, formData.content]);

  // Word and character counting
  useEffect(() => {
    const words = formData.content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
    setCharCount(formData.content.length);
  }, [formData.content]);

  // Calculate optimal rows for content textarea
  useEffect(() => {
    const calculateRows = () => {
      if (!formData.content.trim()) {
        setContentRows(20); // Default height when empty
        return;
      }

      const lines = formData.content.split("\n");
      const maxLineLength = Math.max(...lines.map((line) => line.length));

      // More sophisticated calculation
      const charactersPerLine = 70; // Reduced for more accurate wrapping
      const baseRows = lines.length;
      const wrappedRows = Math.ceil(maxLineLength / charactersPerLine);

      // Calculate based on actual content density
      const estimatedRows = Math.max(baseRows, wrappedRows);

      // Add some buffer for better UX but keep it reasonable
      const bufferRows = Math.ceil(estimatedRows * 0.1);
      const finalRows = estimatedRows + bufferRows;

      // Set minimum and maximum bounds
      const minRows = 20;
      const maxRows = 35; // Adjusted for 600x500 dimensions
      setContentRows(Math.min(Math.max(finalRows, minRows), maxRows));
    };

    calculateRows();
  }, [formData.content]);

  // Show image preview when URL is provided
  useEffect(() => {
    setShowImagePreview(!!formData.featuredImage);
  }, [formData.featuredImage]);

  const categories = [
    "Technology",
    "Lifestyle",
    "Travel",
    "Food",
    "Health",
    "Business",
    "Education",
    "Entertainment",
  ];

  const handleAutoSave = async () => {
    if (!formData.title.trim() && !formData.content.trim()) return;

    setAutoSaveStatus("saving");
    try {
      const postData = {
        ...formData,
        status: "draft",
      };
      await postsAPI.createPost(postData);
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setAutoSaveStatus("error");
      setTimeout(() => setAutoSaveStatus(""), 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleContentResize = (e) => {
    // Allow manual resizing by updating rows based on scroll height
    const textarea = e.target;
    const lineHeight = 24; // Approximate line height in pixels
    const minRows = 20;
    const maxRows = 35;

    const newRows = Math.max(
      minRows,
      Math.min(maxRows, Math.ceil(textarea.scrollHeight / lineHeight))
    );

    setContentRows(newRows);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, status = "draft") => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      // Debug: Check if user is authenticated
      console.log("User authenticated:", isAuthenticated);
      console.log("User data:", user);
      console.log("Token in localStorage:", localStorage.getItem("token"));

      const postData = {
        ...formData,
        status,
      };

      console.log("Sending post data:", postData);

      const response = await postsAPI.createPost(postData);

      if (response.data) {
        // Redirect to the created post or home page
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.slug?.message ||
        "Failed to create post";
      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Box className="create-post-container">
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Header Section */}
        <Box className="create-post-header fade-in" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                width: 48,
                height: 48,
              }}
            >
              <Edit sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 700, mb: 0.25 }}
              >
                Create New Post
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.9, fontWeight: 400 }}
              >
                Share your thoughts with the world
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Auto-save status */}
        <Fade in={!!autoSaveStatus}>
          <Box sx={{ mb: 2 }}>
            {autoSaveStatus === "saving" && (
              <Alert severity="info" className="auto-save-indicator">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Auto-saving...</Typography>
                </Stack>
              </Alert>
            )}
            {autoSaveStatus === "saved" && (
              <Alert severity="success">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AutoAwesome fontSize="small" />
                  <Typography variant="body2">
                    Draft saved automatically
                  </Typography>
                </Stack>
              </Alert>
            )}
            {autoSaveStatus === "error" && (
              <Alert severity="warning">
                <Typography variant="body2">
                  Auto-save failed. Please save manually.
                </Typography>
              </Alert>
            )}
          </Box>
        </Fade>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Main Content */}
          <Grid item xs={12} lg={7}>
            <Paper className="create-post-content fade-in">
              <Box
                component="form"
                onSubmit={(e) => handleSubmit(e, formData.status)}
                sx={{ p: 3, maxWidth: "100%" }}
              >
                {/* Title Section */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Post Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={!!errors.title}
                    helperText={
                      errors.title || `${formData.title.length}/200 characters`
                    }
                    required
                    placeholder="Enter an engaging title for your post"
                    variant="outlined"
                    className="title-input"
                  />
                </Box>

                {/* Content Section */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Content
                    </Typography>
                    <Box className="word-count">
                      {wordCount} words • {charCount} characters
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    onInput={handleContentResize}
                    error={!!errors.content}
                    helperText={errors.content}
                    multiline
                    rows={contentRows}
                    required
                    placeholder="Write your post content here... Use markdown for formatting!"
                    className="content-textarea"
                    sx={{
                      "& .MuiInputBase-root": {
                        transition: "all 0.3s ease",
                      },
                      maxWidth: "100%",
                      width: "100%",
                    }}
                  />
                </Box>

                {/* Excerpt Section */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Excerpt (Optional)"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="A brief summary of your post (will be auto-generated if left empty)"
                    helperText={`${formData.excerpt.length}/500 characters`}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={1.5}>
              {/* Featured Image */}
              <Paper className="sidebar-card fade-in">
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                  >
                    Featured Image
                  </Typography>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    InputProps={{
                      startAdornment: (
                        <Image sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />

                  {showImagePreview && (
                    <Slide direction="up" in={showImagePreview}>
                      <Card
                        className="image-preview"
                        sx={{ mt: 2, overflow: "hidden" }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={formData.featuredImage}
                          alt="Featured image preview"
                          sx={{ objectFit: "cover" }}
                        />
                        <Box
                          sx={{
                            p: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              setFormData({ ...formData, featuredImage: "" })
                            }
                          >
                            <Close />
                          </IconButton>
                        </Box>
                      </Card>
                    </Slide>
                  )}
                </Box>
              </Paper>

              {/* Category & Tags */}
              <Paper className="sidebar-card fade-in">
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                  >
                    Post Settings
                  </Typography>

                  <FormControl
                    fullWidth
                    error={!!errors.category}
                    sx={{ mb: 2 }}
                  >
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <FormHelperText>{errors.category}</FormHelperText>
                    )}
                  </FormControl>

                  <Box>
                    <TextField
                      fullWidth
                      label="Tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      placeholder="Type a tag and press Enter"
                      helperText="Press Enter or comma to add tags"
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={addTag}
                            disabled={!tagInput.trim()}
                          >
                            <Add />
                          </IconButton>
                        ),
                      }}
                    />
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}
                    >
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => removeTag(tag)}
                          color="primary"
                          variant="outlined"
                          size="small"
                          className="tag-chip"
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Post Status & Tips */}
              <Paper className="sidebar-card fade-in">
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                  >
                    Post Status
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Status:{" "}
                      <strong>
                        {formData.status === "draft" ? "Draft" : "Published"}
                      </strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Last saved:{" "}
                      {autoSaveStatus === "saved" ? "Just now" : "Never"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reading time: ~{Math.ceil(wordCount / 200)} min
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Action Buttons */}
              <Paper className="sidebar-card fade-in">
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                  >
                    Actions
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate("/")}
                      fullWidth
                      size="large"
                      className="action-button"
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Save />}
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e, "draft");
                      }}
                      fullWidth
                      size="large"
                      className="action-button"
                    >
                      {isSubmitting ? (
                        <CircularProgress
                          size={20}
                          className="button-loading"
                        />
                      ) : (
                        "Save Draft"
                      )}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Publish />}
                      onClick={(e) => handleSubmit(e, "published")}
                      disabled={isSubmitting}
                      fullWidth
                      size="large"
                      className="action-button publish-button"
                    >
                      {isSubmitting ? (
                        <CircularProgress
                          size={20}
                          color="inherit"
                          className="button-loading"
                        />
                      ) : (
                        "Publish Post"
                      )}
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CreatePost;
