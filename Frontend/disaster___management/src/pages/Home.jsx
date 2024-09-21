// src/pages/Homepage.js

import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import homepageService from '../services/homepageService';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Home = () => {
  const [totalFunds, setTotalFunds] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [recentCrises, setRecentCrises] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  // Fetch the data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total funds
        const fundData = await homepageService.getDonationData();
        setTotalFunds(fundData.total_donated);
        setChartData(fundData.chart_data);
       
     

       
      
        // Fetch recent crises
        const crisesData = await homepageService.getRecentCrises();
        console.log(crisesData)
        setRecentCrises(crisesData);

        // Fetch volunteers
        const volunteerData = await homepageService.getVolunteers();
        setVolunteers(volunteerData);
      } catch (error) {
        console.error('Error fetching homepage data', error);
      }
    };

    fetchData();
  }, []);

  // Prepare data for the bar chart
  
  const BarChartData = {
    labels: chartData.map((data) => data.day),
    
      datasets: [
        {
          label: 'Total Donated',
          data: chartData.map(item => item.total_donated), // Data for total donations
          backgroundColor: 'rgba(75, 192, 192, 0.5)', // Bar color for donations
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Expense',
          data: chartData.map(item => item.total_expense), // Data for total expenses
          backgroundColor: 'rgba(255, 99, 132, 0.5)', // Bar color for expenses
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
    <div className="container mx-auto px-4 py-8">
      {/* Fund Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Total Donated Funds</h2>
        <p className="text-xl mb-4">Total: ${totalFunds}</p>
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Daily Donations & Expenses</h3>
          {/* Bar Chart */}
          <div className="mb-4">
            <Bar data={BarChartData} options={chartOptions} />
          </div>
          <Link to="/donation" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Donation Page
          </Link>
        </div>
      </section>

      {/* Crisis Section */}
      <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Recent Crisis</h2>
      <ul className="space-y-4">
        {recentCrises.map((crisis) => (
          <li key={crisis.id} className="bg-white shadow p-4 rounded-lg">
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
      <Link to="/crisis" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
        Go to Crisis Page
      </Link>
    </section>

      {/* Volunteer Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Available Volunteers</h2>
        <ul className="space-y-4">
          {volunteers.map((volunteer) => (
            <li key={volunteer.id} className="bg-white shadow p-4 rounded-lg">
              <h3 className="text-xl font-semibold">{volunteer.username}</h3>
              <p>Age: {volunteer.age}</p>
              <p>Phone: {volunteer.mobile_number}</p>
              <p>Assigned Task: {volunteer.assigned_tasks}</p>
              <p>Location: {volunteer.location}</p>
            </li>
          ))}
        </ul>
        <Link to="/volunteer" className="mt-4 inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700">
          Go to Volunteer Page
        </Link>
      </section>
    </div>
  );
};

export default Home;
