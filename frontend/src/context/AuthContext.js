import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "UPDATE_USER":
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return {
        ...state,
        user: updatedUser,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          const response = await authAPI.getMe();
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              token,
              user: response.data.user,
            },
          });
        } catch (error) {
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.login(credentials);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data,
      });
      return { success: true };
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.register(userData);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data,
      });
      return { success: true };
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({
      type: "UPDATE_USER",
      payload: userData,
    });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


