// src/services/homepageService.js

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Fetch total donated funds
const getDonationData = async () => {
  const response = await axios.get(`${API_URL}/donations`);
  return response.data;
};

// Fetch daily donations and expenses for the chart


// Fetch recent crises
const getRecentCrises = async () => {
  const response = await axios.get(`${API_URL}/crisis/`);
  return response.data;
};

// Fetch available volunteers
const getVolunteers = async () => {
  const response = await axios.get(`${API_URL}/volunteers`);
  return response.data;
};

const homepageService = {
//   getTotalFunds,
//   getDailyDonationsExpenses,
  getDonationData,
  getRecentCrises,
  getVolunteers,
};

export default homepageService;
