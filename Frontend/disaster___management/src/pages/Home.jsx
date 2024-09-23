import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import homepageService from '../services/homepageService';
import { Bar } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import reportService  from '../services/reportService';
const Home = () => {
  const role = JSON.parse(localStorage.getItem("role"));
  const [totalFunds, setTotalFunds] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [recentCrises, setRecentCrises] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fundData = await homepageService.getDonationData();
        setTotalFunds(fundData.total_donated);
        setChartData(fundData.chart_data);

        const crisesData = await homepageService.getRecentCrises();
        setRecentCrises(crisesData.results);

        const volunteerData = await homepageService.getVolunteers();
        setVolunteers(volunteerData);
      } catch (error) {
        console.error('Error fetching homepage data', error);
      }
    };
    fetchData();
  }, []);

  const BarChartData = {
    labels: chartData.map((data) => data.day),
    datasets: [
      {
        label: 'Total Donated',
        data: chartData.map(item => item.total_donated),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Expense',
        data: chartData.map(item => item.total_expense),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Donations and Expenses Per Day',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-8">
      <div className={`flex justify-center space-x-4 mt-8 ${role === "admin" ? "" : "hidden"}`}>
      <button
        onClick={() => reportService.downloadReport('donation')}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Download Donation Report (CSV)
      </button>
      

      <button
        onClick={() => reportService.downloadReport('expense')}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Download Expense Report (CSV)
      </button>
     

      <button
        onClick={() => reportService.downloadReport('inventory')}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Download Inventory Report (CSV)
      </button>
      
    </div>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 bg-white shadow-lg rounded-lg flex flex-col justify-between">
          <h2 className="text-2xl font-bold mb-4">Total Donated Funds</h2>
          <p className="text-xl mb-4">Total: {totalFunds} BDT</p>
          <Bar data={BarChartData} options={chartOptions} className="mb-4" />
          <Link to="/donation" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center">
            Go to Donation Page
          </Link>
        </div>

        <div className="p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Recent Crises</h2>
          <ul className="space-y-4">
            {recentCrises.slice(0, 3).map((crisis) => (
              <li key={crisis.id} className="p-4 bg-gray-100 rounded-lg">
                <h3 className="text-xl font-semibold">{crisis.title}</h3>
                <p className="text-gray-600">{crisis.description}</p>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-500">Location: {crisis.location}</p>
                  <p className={`text-sm ${
                    crisis.severity === 'high' ? 'text-red-600' : crisis.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    Severity: {crisis.severity.charAt(0).toUpperCase() + crisis.severity.slice(1)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-gray-700">Status: {crisis.status}</p>
                <p className="mt-2 font-bold text-red-600">{crisis.required_help}</p>
              </li>
            ))}
          </ul>
          <Link to="/crisis" className="mt-4 block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center">
            Go to Crisis Page
          </Link>
        </div>
      </section>

      <section className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Available Volunteers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteers.slice(0, 5).map((volunteer) => (
            <div key={volunteer.id} className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-xl font-semibold">{volunteer.username}</h3>
              <p>Age: {volunteer.age}</p>
              <p>Phone: {volunteer.mobile_number}</p>
              <p>Assigned Task: {volunteer.assigned_tasks}</p>
              <p>Location: {volunteer.location}</p>
            </div>
          ))}
        </div>
        <Link to="/volunteer" className="mt-4 block bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-center">
          Go to Volunteer Page
        </Link>
      </section>
    </div>
  );
};

export default Home;
