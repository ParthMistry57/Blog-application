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
} from "@mui/material";
import { Save, Publish, Preview, ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../services/api";

const EditPost = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchPost();
    }
  }, [isAuthenticated, id]);

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

  const fetchPost = async () => {
    try {
      setLoading(true);
      console.log("Fetching post with ID:", id);
      const response = await postsAPI.getPostById(id);
      console.log("Post response:", response);
      const postData = response.data;

      // Check if user is the author
      console.log("Post author ID:", postData.author._id);
      console.log("Current user ID:", user._id);
      console.log("User object:", user);

      if (postData.author._id !== user._id) {
        console.log("User not authorized to edit this post");
        navigate("/");
        return;
      }

      setPost(postData);
      setFormData({
        title: postData.title || "",
        content: postData.content || "",
        excerpt: postData.excerpt || "",
        category: postData.category || "",
        tags: postData.tags || [],
        featuredImage: postData.featuredImage || "",
        status: postData.status || "draft",
      });
    } catch (err) {
      console.error("Error fetching post:", err);
      setErrors({ general: "Failed to load post" });
    } finally {
      setLoading(false);
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
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters";
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

      const response = await postsAPI.updatePost(id, postData);

      if (response.data) {
        // Redirect to the updated post or home page
        navigate(`/post/${response.data.post.slug}`);
      }
    } catch (err) {
      console.error("Error updating post:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.slug?.message ||
        "Failed to update post";
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box>
        <Alert severity="error">
          Post not found or you don't have permission to edit it.
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Edit Post
          </Typography>
        </Box>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <form onSubmit={(e) => handleSubmit(e, "draft")}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Post Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category} required>
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
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Featured Image URL"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Excerpt (Optional)"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                helperText="A brief description of your post"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                variant="outlined"
                helperText="Press Enter or comma to add tags"
              />
              <Box mt={1}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                multiline
                rows={12}
                error={!!errors.content}
                helperText={errors.content}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  onClick={() => navigate(`/post/${post.slug}`)}
                >
                  Preview
                </Button>
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<Save />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={20} /> : "Save Draft"}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<Publish />}
                  onClick={(e) => handleSubmit(e, "published")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Update & Publish"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditPost;
