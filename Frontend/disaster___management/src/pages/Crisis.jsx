// src/pages/CrisisPage.js

import { useEffect, useState } from 'react';
import crisisService from '../services/crisisService';

const Crisis = () => {
  const [crises, setCrises] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newCrisis, setNewCrisis] = useState({
    title: '',
    location: '',
    description: '',
    severity: 'low',
    status: 'active',
    required_help: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all crises on component mount
  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const crisisData = await crisisService.getCrises();
        console.log(crisisData)
        setCrises(crisisData);
      } catch (error) {
        console.error('Error fetching crisis data:', error);
      }
    };

    fetchCrises();
  }, []);

  // Filter crises based on severity
  const filteredCrises = crises.filter((crisis) => {
    if (filter === 'all') return true;
    return crisis.severity === filter;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrisis({ ...newCrisis, [name]: value });
  };

  // Handle image input
  const handleImageChange = (e) => {
    setNewCrisis({ ...newCrisis, image: e.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in newCrisis) {
      if (key === 'image' && newCrisis[key] === null) continue; // Skip appending image if null
      formData.append(key, newCrisis[key]);
    }

    try {
      await crisisService.createCrisis(formData);
      setSuccess('Crisis added successfully! Awaiting admin approval.');
      setNewCrisis({
        title: '',
        location: '',
        description: '',
        severity: 'low',
        status: 'active',
        required_help: '',
        image: null,
      });
      setError('');
      // Re-fetch crises to update the list
      const crisisData = await crisisService.getCrises();
      setCrises(crisisData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding crisis. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Crisis Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section: Crisis List with Filter */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Existing Crisis</h2>

          {/* Filter Dropdown */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="filter">
              Filter by Severity:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full p-2 border rounded-md bg-white"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Crisis List */}
          <ul className="space-y-4">
            {filteredCrises.length === 0 ? (
              <p>No crises found.</p>
            ) : (
              filteredCrises.map((crisis) => (
                <li key={crisis.id} className="bg-white shadow-lg rounded-lg p-6">
                  {crisis.image && crisis.image !== null && (
                      <img src={crisis.image} className="mt-4 rounded-lg" />
                    )}
                  <h2 className="text-2xl font-semibold mb-2">{crisis.title}</h2>
                  <p className="text-gray-700 mb-2">
                    <strong>Location:</strong> {crisis.location}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Description:</strong> {crisis.description}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Severity:</strong> {crisis.severity}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Status:</strong> {crisis.status}
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Required Help:</strong> {crisis.required_help}
                  </p>
                
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Right Section: Add New Crisis Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Add a New Crisis</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-4">
              <label className="block text-gray-700">Title:</label>
              <input
                type="text"
                name="title"
                value={newCrisis.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Location:</label>
              <input
                type="text"
                name="location"
                value={newCrisis.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Description:</label>
              <textarea
                name="description"
                value={newCrisis.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Severity:</label>
              <select
                name="severity"
                value={newCrisis.severity}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Required Help:</label>
              <input
                type="text"
                name="required_help"
                value={newCrisis.required_help}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Image (optional):</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Submit Crisis
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Crisis;
