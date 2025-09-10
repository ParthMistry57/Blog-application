import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../utils/helpers";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData);
      if (result.success) {
        navigate("/");
      } else {
        setErrors({ general: result.message });
      }
    } catch (err) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign In
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Welcome back! Please sign in to your account.
        </Typography>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            required
            autoComplete="email"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            required
            autoComplete="current-password"
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <CircularProgress size={24} />
            ) : (
              "Sign In"
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link component={RouterLink} to="/register">
                Create one here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
