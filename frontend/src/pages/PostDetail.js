import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Visibility,
  Comment,
  Share,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../services/api";
import { formatRelativeTime, getInitials } from "../utils/helpers";

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPost(slug); // Ensure the slug is being passed correctly to the API
      setPost(response.data);
      setError(null);
    } catch (err) {
      setError("Post not found");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await postsAPI.likePost(post._id);
      // Refresh post to get updated like count
      fetchPost();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${post._id}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postsAPI.deletePost(post._id);
        navigate("/");
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  const isAuthor = user && post && user.id === post.author._id;
  const isAdmin = user && user.role === "admin";

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || "Post not found"}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Featured Image */}
      {post.featuredImage && (
        <Box sx={{ mb: 3 }}>
          <img
            src={post.featuredImage}
            alt={post.title}
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </Box>
      )}

      {/* Post Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {post.title}
        </Typography>

        {/* Author Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={post.author?.avatar}
            sx={{ width: 48, height: 48, mr: 2 }}
          >
            {getInitials(post.author?.firstName, post.author?.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {post.author?.firstName} {post.author?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatRelativeTime(post.publishedAt || post.createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Categories and Tags */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Chip
            label={post.category}
            color="primary"
            variant="outlined"
            size="small"
          />
          {post.tags?.map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={handleLike}
              color={isLiked ? "error" : "default"}
            >
              {isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {post.likes?.length || 0} likes
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Visibility sx={{ fontSize: 20, mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {post.views || 0} views
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Comment sx={{ fontSize: 20, mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {post.comments?.length || 0} comments
            </Typography>
          </Box>

          <IconButton>
            <Share />
          </IconButton>

          {/* Author/Admin Actions */}
          {(isAuthor || isAdmin) && (
            <>
              <Divider orientation="vertical" flexItem />
              <IconButton onClick={handleEdit} color="primary">
                <Edit />
              </IconButton>
              <IconButton onClick={handleDelete} color="error">
                <Delete />
              </IconButton>
            </>
          )}
        </Box>
      </Paper>

      {/* Post Content */}
      <Paper elevation={1} sx={{ p: 4 }}>
        {post.excerpt && (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 3, fontStyle: "italic" }}
          >
            {post.excerpt}
          </Typography>
        )}

        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            fontSize: "1.1rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {post.content}
        </Typography>
      </Paper>

      {/* Comments Section - Placeholder for now */}
      <Paper elevation={1} sx={{ p: 4, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({post.comments?.length || 0})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comments feature coming soon!
        </Typography>
      </Paper>
    </Box>
  );
};

export default PostDetail;
