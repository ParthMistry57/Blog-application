import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { Search, FilterList } from "@mui/icons-material";
import PostCard from "../components/PostCard";
import { postsAPI } from "../services/api";
import { debounce } from "../utils/helpers";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

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

  const popularTags = [
    "react",
    "javascript",
    "nodejs",
    "web-development",
    "programming",
    "tutorial",
    "tips",
    "review",
  ];

  const fetchPosts = async (
    page = 1,
    search = "",
    cat = "",
    tagFilter = ""
  ) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        ...(search && { search }),
        ...(cat && { category: cat }),
        ...(tagFilter && { tag: tagFilter }),
      };

      const response = await postsAPI.getPosts(params);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setTotalPosts(response.data.total);
      setError(null);
    } catch (err) {
      setError("Failed to fetch posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce((searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
    fetchPosts(1, searchValue, category, tag);
  }, 500);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setCategory(newCategory);
    setCurrentPage(1);
    fetchPosts(1, searchTerm, newCategory, tag);
  };

  const handleTagChange = (event) => {
    const newTag = event.target.value;
    setTag(newTag);
    setCurrentPage(1);
    fetchPosts(1, searchTerm, category, newTag);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    fetchPosts(page, searchTerm, category, tag);
  };

  const handleLike = async (postId) => {
    try {
      await postsAPI.likePost(postId);
      // Refresh posts to get updated like count
      fetchPosts(currentPage, searchTerm, category, tag);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Latest Blog Posts
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search posts..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={handleCategoryChange}
                label="Category"
                sx={{
                  minWidth: 150, // added this line
                  "& .MuiSvgIcon-root": {
                    color: "primary.main",
                  },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tag</InputLabel>
              <Select
                value={tag}
                onChange={handleTagChange}
                label="Tag"
                sx={{
                  minWidth: 150, // added this line
                  "& .MuiSvgIcon-root": {
                    color: "primary.main",
                  },
                }}
              >
                <MenuItem value="">All Tags</MenuItem>
                {popularTags.map((tagName) => (
                  <MenuItem key={tagName} value={tagName}>
                    #{tagName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterList />
              <Typography variant="body2" color="text.secondary">
                {totalPosts} posts
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Posts Grid */}
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
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post._id}>
                <PostCard post={post} onLike={handleLike} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Home;
