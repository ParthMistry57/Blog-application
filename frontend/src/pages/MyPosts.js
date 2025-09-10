import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Edit,
  Delete,
  Visibility,
  Favorite,
  Comment,
  Publish,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../services/api";
import { formatRelativeTime } from "../utils/helpers";

const MyPosts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    postId: null,
  });

  const fetchPosts = React.useCallback(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const status =
          tabValue === 0 ? "published" : tabValue === 1 ? "draft" : "";
        console.log("Fetching posts with status:", status);
        const response = await postsAPI.getUserPosts({ status });
        console.log("Received posts:", response.data);
        if (response.data && Array.isArray(response.data.posts)) {
          setPosts(response.data.posts);
          setError(null);
        } else {
          console.error("Invalid posts data format:", response.data);
          setError("Failed to load posts: Invalid data format");
        }
      } catch (err) {
        setError("Failed to fetch posts");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [tabValue]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, fetchPosts]);

  const handleDelete = async () => {
    try {
      await postsAPI.deletePost(deleteDialog.postId);
      setDeleteDialog({ open: false, postId: null });
      fetchPosts(); // Refresh the list
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/edit/${postId}`);
  };

  const handleView = (post) => {
    // For draft posts, navigate to edit page instead of view
    if (post.status === "draft") {
      navigate(`/edit/${post._id}`);
    } else {
      navigate(`/post/${post.slug}`);
    }
  };

  const handlePublish = async (postId) => {
    try {
      // Get the current post data
      const post = posts.find((p) => p._id === postId);
      if (!post) return;

      // Update the post status to published
      await postsAPI.updatePost(postId, { ...post, status: "published" });

      // Refresh the posts list
      fetchPosts();
    } catch (err) {
      console.error("Error publishing post:", err);
      setError("Failed to publish post");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "default";
      default:
        return "default";
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Posts
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Published" />
        <Tab label="Drafts" />
        <Tab label="All" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No posts found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {tabValue === 0
              ? "You haven't published any posts yet."
              : tabValue === 1
              ? "You don't have any draft posts."
              : "You don't have any posts yet."}
          </Typography>
          <Button variant="contained" onClick={() => navigate("/create")}>
            Create Your First Post
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {post.featuredImage && (
                  <Box
                    component="img"
                    src={post.featuredImage}
                    alt={post.title}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Chip
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatRelativeTime(post.publishedAt || post.createdAt)}
                    </Typography>
                  </Box>

                  <Typography variant="h6" component="h2" gutterBottom>
                    {post.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {post.excerpt || post.content.substring(0, 100) + "..."}
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                  >
                    <Chip
                      label={post.category}
                      size="small"
                      variant="outlined"
                    />
                    {post.tags?.slice(0, 2).map((tag, index) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {post.views || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Favorite sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {post.likes?.length || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Comment sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {post.comments?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={post.status === "draft" ? <Edit /> : <Visibility />}
                    onClick={() => post.status === "draft" ? handleEdit(post._id) : handleView(post)}
                  >
                    {post.status === "draft" ? "Edit" : "View"}
                  </Button>
                  {post.status === "draft" && (
                    <Button
                      size="small"
                      startIcon={<Publish />}
                      onClick={() => handlePublish(post._id)}
                      color="primary"
                      variant="contained"
                    >
                      Publish
                    </Button>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() =>
                      setDeleteDialog({ open: true, postId: post._id })
                    }
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, postId: null })}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, postId: null })}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPosts;
