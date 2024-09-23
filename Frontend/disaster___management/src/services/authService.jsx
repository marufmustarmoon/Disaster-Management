// src/services/authService.js

import axios from 'axios';

const API_URL = 'https://disaster-management-6kgh.onrender.com/api'; // Adjust the URL to match your backend

// Register a new user (Volunteer)
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register/`, userData);

//   if (response.data) {
//     localStorage.setItem('user', JSON.stringify(response.data));
//   }

  return response.data;
};

// Login user (Volunteer or Admin)
const login = async (userData) => {
  localStorage.removeItem('user');
  const response = await axios.post(`${API_URL}/login/`, userData);
  if (response.data.access) {

    localStorage.setItem('user', JSON.stringify(response.data.access));
    localStorage.setItem('username', JSON.stringify(response.data.username));
    localStorage.setItem('role', JSON.stringify(response.data.role));
   

  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
};




// Get the current logged-in user from localStorage
const getCurrentUser = () => {
  console.log(JSON.parse(localStorage.getItem('username')))
  return JSON.parse(localStorage.getItem('username'));
};

// Set the Authorization header with JWT token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Automatically set token if user is logged in
const user = getCurrentUser();
if (user && user.token) {
  setAuthToken(user.token);
}

const authService = {
  register,
  
  login,
  logout,
  getCurrentUser,
  setAuthToken,
};

export default authService;
