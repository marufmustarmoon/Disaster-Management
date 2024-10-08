// src/services/donationService.js

import axios from 'axios';

const API_URL = 'https://disaster-management-6kgh.onrender.com/api/donations'; // Adjust the API endpoint as needed

const getDonations = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const addDonation = async (donationData) => {
  const response = await axios.post(API_URL, donationData);
  return response.data;
};



const donationService = {
    getDonations,
    addDonation,
    };
    
export default donationService;