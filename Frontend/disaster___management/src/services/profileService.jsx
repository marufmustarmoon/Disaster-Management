// src/services/authService.js

import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; 




const getProfile = async () => {
  const token = JSON.parse(localStorage.getItem('user'))
  console.log("token",token)
  if (!token) throw new Error('No token found');

  const response = await axios.get(`${API_URL}/account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("error")
  console.log(response.data)
  return response.data;
};


// Get the current logged-in user from localStorage


const profileService = {
 
  getProfile,

};

export default profileService;
