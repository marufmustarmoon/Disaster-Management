// src/services/authService.js

import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Adjust the URL to match your backend

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
   console.log(response.data)
   console.log(response.data.access)
  if (response.data.access) {

    localStorage.setItem('user', JSON.stringify(response.data.access));
    localStorage.setItem('username', JSON.stringify(response.data.username));
   

  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('username');
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
