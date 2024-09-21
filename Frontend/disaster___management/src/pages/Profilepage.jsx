// src/pages/ProfilePage.js

import { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    username: '',
    age: '',
    location: '',
    mobile_number: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await profileService.getProfile();
        console.log("userdata",userProfile)
        setProfile(userProfile);
        console.log("userdata",userProfile)


      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate('/login'); 
        } else {
          setError('Error fetching profile data');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Assuming an update profile API exists
      await profileService.updateProfile(profile);
      alert('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Error updating profile');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Username:</label>
          <input
            type="text"
            name="username"
            value={profile.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Age:</label>
          <input
            type="text"
            name="age"
            value={profile.age}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Location:</label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mobile Number:</label>
          <input
            type="text"
            name="mobile_number"
            value={profile.mobile_number}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
