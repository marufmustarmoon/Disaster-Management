import axios from 'axios';

const API_URL = 'https://disaster-management-6kgh.onrender.com/'; // Adjust the API endpoint as needed

const getCrises = async (page = 1,itemsPerPage=5) => {
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


const createCrisis = async (crisisData) => {
  const token = JSON.parse(localStorage.getItem("user"));

  try {
    const headers = {
      'Content-Type': 'multipart/form-data', 
      Authorization: token ? `Bearer ${token}` : undefined,
    };
    const response = await axios.post(API_URL, crisisData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error creating crisis:", error);
   
    return { error: 'Error creating crisis' }; // Or a more specific error message
  }
};

const updateCrisis = async (id, crisisData) => {
  console.log("id",id)
  const token = JSON.parse(localStorage.getItem("user"));

  try {
    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: token ? `Bearer ${token}` : undefined,
    };

    console.log("crisisData",crisisData)

    const response = await axios.put(API_URL, crisisData, { headers, params: { id }, });
    return response.data;

  } catch (error) {
    console.error("Error updating crisis:", error);
    return { error: 'Error updating crisis' };
  }
};


 

const deleteCrisis = async (id) => {
    console.log("id",id)
    const token = JSON.parse(localStorage.getItem("user"));

    try {
      const headers = {
      
        Authorization: token ? `Bearer ${token}` : undefined,
      };

     
      const response = await axios.delete(`${API_URL}`,  { headers, params: { id }, });
      return response.data;

    } catch (error) {
      console.error("Error updating crisis:", error);
      return { error: 'Error updating crisis' };
    }
};
const respondToCrisis = (id, message) => {
  const token = JSON.parse(localStorage.getItem("user"));
  const headers = {
      
    Authorization: token ? `Bearer ${token}` : undefined,
  };
  return axios.post(`${API_URL}${id}/respond/`, { message },{headers});
}; 

const crisisService = {
  getCrises,
  createCrisis,
  updateCrisis,
  deleteCrisis,
  respondToCrisis
  
};

export default crisisService;
