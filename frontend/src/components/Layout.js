import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  AccountCircle,
  Home,
  Add,
  Login,
  Logout,
  Person,
} from "@mui/icons-material";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/");
  };

  const handleProfile = () => {
    if (user && (user._id || user.id)) {
      navigate(`/profile/${user._id || user.id}`);
      handleClose();
    } else {
      console.warn("User data not available");
    }
  };

  const handleMyPosts = () => {
    navigate("/myposts");
    handleClose();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Container maxWidth="lg">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Blog App
            </Typography>

            <Button
              color="inherit"
              startIcon={<Home />}
              onClick={() => navigate("/")}
              sx={{ mr: 2 }}
            >
              Home
            </Button>

            {isAuthenticated && (
              <Button
                color="inherit"
                startIcon={<Add />}
                onClick={() => navigate("/create")}
                sx={{ mr: 2 }}
              >
                Write Post
              </Button>
            )}

            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user?.avatar ? (
                    <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleProfile}>
                    <Person sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleMyPosts}>
                    <Add sx={{ mr: 1 }} />
                    My Posts
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box>
                <Button
                  color="inherit"
                  startIcon={<Login />}
                  onClick={() => navigate("/login")}
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={() => navigate("/register")}
                  sx={{ borderColor: "white", color: "white" }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
