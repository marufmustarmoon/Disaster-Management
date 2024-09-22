import axios from 'axios';

const API_URL = 'http://localhost:8000/api/inventory'; // Replace with your actual API URL

const inventoryService = {
  // Get all inventory items
  getInventory: async () => {
    const token = JSON.parse(localStorage.getItem("user"));
    if (!token) throw new Error("No token found");
    const response = await axios.get(`${API_URL}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Add new inventory item
  addInventory: async (newItem) => {
    const token = JSON.parse(localStorage.getItem("user"));
    if (!token) throw new Error("No token found");
    const response = await axios.post(`${API_URL}/`, newItem, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update inventory item
  updateInventory: async (itemId, updatedItem) => {
    const token = JSON.parse(localStorage.getItem("user"));
    if (!token) throw new Error("No token found");
    const response = await axios.put(`${API_URL}/`, updatedItem, {
      params: {
        itemId: itemId, 
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Delete inventory item
  deleteInventory: async (itemId) => {
    const token = JSON.parse(localStorage.getItem("user"));
    if (!token) throw new Error("No token found");
    const response = await axios.delete(`${API_URL}/`, {
      params: {
        itemId: itemId, // Query parameter
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default inventoryService;
