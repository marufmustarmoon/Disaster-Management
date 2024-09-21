// src/layouts/MainLayout.js
/* eslint-disable react/prop-types */


import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar at the top */}
      <Navbar />
      
      {/* Main content area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children} {/* This renders the content of the page (e.g., Home, Donation, Crisis) */}
      </main>
      
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default MainLayout;
