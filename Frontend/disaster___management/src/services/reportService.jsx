const API_URL = 'https://disaster-management-6kgh.onrender.com/api/reports'; 

const downloadReport = async (reportType) => {
  const token = JSON.parse(localStorage.getItem('user'))
  if (!token) throw new Error("No token found");
  try {
    const response = await fetch(`${API_URL}/${reportType}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.csv`;
      a.click();
    } else {
      throw new Error('Failed to download report.');
    }
  } catch (error) {
    console.error('Error downloading report:', error);
  }
};


const reportService = {
 
    downloadReport,
    
  
  };
  
export default   reportService;
  