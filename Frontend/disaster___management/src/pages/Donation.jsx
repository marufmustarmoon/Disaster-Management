// src/pages/DonationPage.js

import  { useState, useEffect } from 'react';
import donationService from '../services/donationService';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Donation = () => {
  const [donationAmount, setDonationAmount] = useState('');
  const [userName, setUserName] = useState('');
  const [allTimeDonations, setAllTimeDonations] = useState(0);
  const [chartData, setChartData] = useState([]);
 
  const [formError, setFormError] = useState('');

  
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const donationData = await donationService.getDonations();
      
        setAllTimeDonations(donationData.total_donated);
        setChartData(donationData.chart_data);
       
      } catch (error) {
        console.error('Error fetching donation data:', error);
      }
    };

    fetchDonations();
  }, []);

  
  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
      setFormError('Please enter a valid donation amount.');
      return;
    }

    try {
      await donationService.addDonation({ donor_name: userName,amount: donationAmount });
      setDonationAmount(''); 
      setFormError(''); 
      
      const donationData = await donationService.getDonations();
      
      setAllTimeDonations(donationData.total_donated);
      setChartData(donationData.chart_data);
   
    } catch (error) {
      console.error('Error submitting donation:', error);
    }
  };

 
  const BarChartData = {
    labels: chartData.map((data) => data.day),
    datasets: [
      {
        label: 'Donations',
        data: chartData.map(item => item.total_donated),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: chartData.map(item => item.total_expense),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Donation Page</h1>

    
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-center">All-time Donations: {allTimeDonations} BDT</h2>
      </div>

      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-center">Daily Donations and Expenses</h3>
        <Bar data={BarChartData} />
      </div>

     
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Make a Donation</h3>
        <form onSubmit={handleDonationSubmit}>
         <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-2 mb-4 border rounded-md"
          />
          <input
            type="text"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Enter donation amount"
            className="w-full p-2 mb-4 border rounded-md"
          />
          {formError && <p className="text-red-500">{formError}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Donate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donation;
