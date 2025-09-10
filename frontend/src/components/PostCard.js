import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  CardActions,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Visibility,
  Comment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  formatRelativeTime,
  generateExcerpt,
  getInitials,
} from "../utils/helpers";

const PostCard = ({ post, onLike, showActions = true }) => {
  const navigate = useNavigate();

  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) {
      onLike(post._id);
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${post.slug}`);
  };

  const isLiked = post.likes?.some((like) =>
    typeof like === "string"
      ? like === post.currentUser?.id
      : like._id === post.currentUser?.id
  );

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        mb: 2,
      }}
      onClick={handleCardClick}
    >
      {post.featuredImage && (
        <CardMedia
          component="img"
          height="200"
          image={post.featuredImage}
          alt={post.title}
          sx={{ objectFit: "cover" }}
        />
      )}

      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            "&:hover .author-name": {
              color: "primary.main",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (post.author?._id) {
              navigate(`/profile/${post.author._id}`);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <Avatar
            src={post.author?.avatar}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {getInitials(post.author?.firstName, post.author?.lastName)}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              className="author-name"
              sx={{
                transition: "color 0.2s ease-in-out",
                color: "text.secondary",
              }}
            >
              {post.author?.firstName} {post.author?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(post.publishedAt || post.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" component="h2" gutterBottom>
          {post.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {post.excerpt || generateExcerpt(post.content)}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Chip
            label={post.category}
            size="small"
            color="primary"
            variant="outlined"
          />
          {post.tags?.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

        {showActions && (
          <CardActions sx={{ justifyContent: "space-between", px: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  size="small"
                  onClick={handleLike}
                  color={isLiked ? "error" : "default"}
                >
                  {isLiked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {post.likes?.length || 0}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {post.views || 0}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Comment sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {post.comments?.length || 0}
                </Typography>
              </Box>
            </Box>
          </CardActions>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
