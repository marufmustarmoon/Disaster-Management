// src/services/crisisService.js

import axios from 'axios';

const API_URL = 'http://localhost:8000/api/crisis/'; // Adjust the API endpoint as needed

const getCrises = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createCrisis = async (crisisData) => {
  const response = await axios.post(API_URL, crisisData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    
  });
  return response.data;
};

const crisisService = {
    getCrises,
    createCrisis
    };
    
export default crisisService;



