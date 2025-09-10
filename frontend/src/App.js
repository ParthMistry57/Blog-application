import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import necessary components
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PostDetail from "./pages/PostDetail";
import EditPost from "./pages/EditPost";
import MyPosts from "./pages/MyPosts";
import Profile from "./pages/Profile"; // Import the Profile component
import "./App.css";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/post/:slug" element={<PostDetail />} />
              <Route path="/edit-post/:id" element={<EditPost />} />
              <Route path="/myposts" element={<MyPosts />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
