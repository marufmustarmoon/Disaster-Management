// src/services/volunteerService.js

import axios from "axios";

const API_URL = "http://localhost:8000/api/volunteers"; // Adjust the API endpoint as needed
const TASK_API_URL = "http://localhost:8000/api/tasks"; // Adjust the API endpoint as needed


const getVolunteers = async (page = 1,itemsPerPage=5) => {
  const token = JSON.parse(localStorage.getItem("user"));
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {undefined};
    const response = await axios.get(`${API_URL}?page=${page}`, { headers });
    return {
      data: response.data, 
      totalPages: Math.ceil(response.data.count / itemsPerPage),
    };
  } catch (error) {
    console.error("Error fetching crises:", error);
   
    return {}; 
  }
};


const getTasks = async () => {
  const token = JSON.parse(localStorage.getItem("user"));
  console.log("moon", token); // Debug log to check token
  if (!token) throw new Error("No token found");

  try {
    const response = await axios.get(TASK_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("moon", response.data); // Debug log to check response data
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error; // Rethrow the error to handle it further upstream
  }
};


const assignTask = async (volunteerId, taskId) => {
  const token = JSON.parse(localStorage.getItem("user"));
  console.log("assigntask", token); 
  if (!token) throw new Error("No token found");

  try {
  const response = await axios.post(`${API_URL}/${volunteerId}/assign_task/`, 
    {task_id: taskId},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
  });
  return response.data;
} catch (error) {
  console.error("Error fetching tasks:", error);
  throw error; // Rethrow the error to handle it further upstream
}
};

const deleteTask = async (volunteerId, taskId) => {
  const token = JSON.parse(localStorage.getItem("user"));
  console.log("deletetask", token); 
  if (!token) throw new Error("No token found");

  try {
    // Include task_id as a query parameter
    const response = await axios.delete(`${API_URL}/${volunteerId}/assign_task/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        task_id: taskId, // Query parameter
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error deleting tasks:", error);
    throw error; // Rethrow the error to handle it further upstream
  }
};

const volunteerService = {
  getVolunteers,
  assignTask,
  getTasks,
  deleteTask,
};

export default volunteerService;
