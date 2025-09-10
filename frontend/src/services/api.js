import axios from "axios";
import config from "../config";

const API_URL = config.API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
};

// Posts API
export const postsAPI = {
  getPosts: (params) => api.get("/posts", { params }),
  getPost: (slug) => api.get(`/posts/${slug}`),
  getPostById: (id) => api.get(`/posts/by-id/${id}`),
  createPost: (postData) => api.post("/posts", postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  getUserPosts: (params) => api.get("/posts/user/posts", { params }),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get("/users", { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) =>
    api.put(`/users/${id}/status`, { isActive }),
};

// Replace fetch-based helpers with axios wrappers that use the existing `api` instance
export async function getUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export default api;
