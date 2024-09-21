import { useEffect, useState } from 'react';
import volunteerService from '../services/volunteerService';

const Volunteer = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');

  const fetchVolunteers = async () => {
    try {
      const volunteerData = await volunteerService.getVolunteers();
      setVolunteers(volunteerData);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await volunteerService.getTasks();
        setAvailableTasks(tasksData);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };

    fetchTasks();
  }, []);

  // Filter volunteers based on the selected location
  const filteredVolunteers = volunteers.filter((volunteer) => {
    if (!locationFilter) return true;
    return volunteer.location.toLowerCase().includes(locationFilter.toLowerCase());
  });

  // Open the assign task modal
  const openAssignModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowAssignModal(true);
  };

  // Open the delete task modal
  const openDeleteModal = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDeleteModal(true);
  };

  // Handle task assignment
  const handleAssignTask = async () => {
    if (selectedTask && selectedVolunteer) {
      try {
        await volunteerService.assignTask(selectedVolunteer.id, selectedTask);
        alert(`Task assigned successfully to ${selectedVolunteer.username}`);
        await fetchVolunteers();
        setShowAssignModal(false);
        setSelectedTask('');
      } catch (error) {
        console.error('Error assigning task:', error);
      }
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (selectedTask && selectedVolunteer) {
      try {
        await volunteerService.deleteTask(selectedVolunteer.id, selectedTask);
        alert(`Task deleted successfully from ${selectedVolunteer.username}`);
        await fetchVolunteers();
        setShowDeleteModal(false);
        setSelectedTask('');
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Volunteers</h1>

      {/* Location Filter */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="locationFilter">
          Search by Location:
        </label>
        <input
          type="text"
          id="locationFilter"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="block w-full p-2 border rounded-md"
          placeholder="Enter location (e.g., Dhaka)"
        />
      </div>

      {/* Volunteers List */}
      <ul className="space-y-4">
        {filteredVolunteers.length === 0 ? (
          <p>No volunteers found.</p>
        ) : (
          filteredVolunteers.map((volunteer) => (
            <li key={volunteer.id} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">{volunteer.username}</h2>
              <p className="text-gray-700 mb-2">
                <strong>Age:</strong> {volunteer.age}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Location:</strong> {volunteer.location}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Mobile Number:</strong> {volunteer.mobile_number}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Role:</strong> {volunteer.role}
              </p>
              {volunteer.assigned_tasks.length > 0 ? (
                <div>
                  <strong>Assigned Tasks:</strong>
                  <ul className="list-disc list-inside">
                    {volunteer.assigned_tasks.map((task, index) => (
                      <li key={index}>
                        {task}
                        {/* Delete Task Button */}
                       
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">No assigned tasks</p>
              )}
              {/* Assign Task Button */}
              <button
                onClick={() => openAssignModal(volunteer)}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Assign Task
              </button>
              <button
                          onClick={() => openDeleteModal(volunteer)}
                          className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:text-red-700"
                        >
                          Delete Task
                        </button>
            </li>
          ))
        )}
      </ul>

      {/* Modal for Assigning Task */}
      {showAssignModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Assign Task to {selectedVolunteer?.username}</h2>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taskSelect">
              Select Task:
            </label>
            <select
              id="taskSelect"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="block w-full p-2 border rounded-md"
            >
              <option value="">Select a task</option>
              {availableTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleAssignTask}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Assign Task
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Deleting Task */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Delete Task from {selectedVolunteer?.username}</h2>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="taskDeleteSelect">
              Select Task to Delete:
            </label>
            <select
              id="taskDeleteSelect"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="block w-full p-2 border rounded-md"
            >
              <option value="">Select a task</option>
              {selectedVolunteer?.assigned_tasks.map((task, index) => (
                <option key={index} value={task}>
                  {task}
                </option>
              ))}
            </select>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleDeleteTask}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Delete Task
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteer;
