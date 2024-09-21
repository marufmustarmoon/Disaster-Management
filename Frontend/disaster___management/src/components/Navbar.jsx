// src/components/Navbar.js

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService"; // Assume authService is handling token and logout

const Navbar = () => {
  const [user, setUser] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Fetch user details when Navbar loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        console.log("userdata", userData);
        setUser(userData);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setUser(null); 
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout(); 
    setUser(null); 
    navigate("/login"); 
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Disaster Management
        </Link>
        <div className="relative">
          {user ? (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-white text-lg focus:outline-none"
            >
              {user}
            </button>
          ) : (
            // If user is not logged in, display Sign Up
            <Link to="/login" className="text-white text-lg">
              Sign Up
            </Link>
          )}
          {showDropdown && user && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20">
              <Link
                to="/account"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
