import { useEffect, useState } from "react";
import crisisService from "../services/crisisService";

const Crisis = () => {
  const token = JSON.parse(localStorage.getItem("user"));
  const role = JSON.parse(localStorage.getItem("role"));
  console.log("check token", token);
  const [crises, setCrises] = useState([]);
  const [filter, setFilter] = useState("all");
  const [newCrisis, setNewCrisis] = useState({
    title: "",
    location: "",
    description: "",
    severity: "low",
    status: "active",
    required_help: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [responseMessage, setResponseMessage] = useState("");
  const [showResponseModal, setShowResponseModal] = useState(false);
  const itemsPerPage = 5;

  // Fetch all crises on component mount
  useEffect(() => {
    const fetchCrises = async () => {
      try {
        const crisisData = await crisisService.getCrises(
          currentPage,
          itemsPerPage
        );
        console.log("crisisdata", currentPage);
        setCrises(crisisData.data.results);
        setTotalPages(crisisData.totalPages);
      } catch (error) {
        console.error("Error fetching crisis data:", error);
      }
    };

    fetchCrises();
  }, [currentPage]);

  // Filter crises based on severity
  const filteredCrises = crises.filter((crisis) => {
    if (filter === "all") return true;
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
      // Skip image if null
      if (key === "image" && newCrisis[key] === null) continue;

      // Log to ensure fields are being added
      console.log(`${key}: `, newCrisis[key]);

      formData.append(key, newCrisis[key]);
    }

    try {
      if (selectedCrisis) {
        // Update crisis logic
        await crisisService.updateCrisis(selectedCrisis.id, formData);
        setSuccess("Crisis updated successfully!");
      } else {
        // Create new crisis logic
        await crisisService.createCrisis(formData);
        setSuccess("Crisis added successfully! Awaiting admin approval.");
      }

      // Reset the form and state after submission
      setNewCrisis({
        title: "",
        location: "",
        description: "",
        severity: "low",
        status: "active",
        required_help: "",
        image: null,
      });
      setError("");
      setShowModal(false);
      setSelectedCrisis(null);

      // Re-fetch crises to update the list
      const crisisData = await crisisService.getCrises(currentPage);
      setCrises(crisisData.data.results);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Error processing crisis. Please try again."
      );
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCrisis) return;
    try {
      await crisisService.deleteCrisis(selectedCrisis.id);
      setSuccess("Crisis deleted successfully!");
      setShowDeleteModal(false);
      setSelectedCrisis(null);
      // Re-fetch crises to update the list
      const crisisData = await crisisService.getCrises(currentPage);
      setCrises(crisisData.data.results);
    } catch (error) {
      setError(error.message | "Error deleting crisis.");
    }
  };

  useEffect(() => {
    if (selectedCrisis) {
      // Copy selectedCrisis to newCrisis when a crisis is selected for editing
      setNewCrisis({
        title: selectedCrisis.title,
        location: selectedCrisis.location,
        description: selectedCrisis.description,
        severity: selectedCrisis.severity,
        status: selectedCrisis.status,
        required_help: selectedCrisis.required_help,
        image: null,
      });
    } else {
      // Reset form when adding a new crisis
      setNewCrisis({
        title: "",
        location: "",
        description: "",
        severity: "low",
        status: "active",
        required_help: "",
        image: null,
      });
    }
  }, [selectedCrisis]);

  const handleRespondToCrisis = async (crisisId) => {
    try {
      await crisisService.respondToCrisis(crisisId, responseMessage);
      setSuccess("Response submitted successfully!");
      setError("");
      setShowResponseModal(false);
      const crisisData = await crisisService.getCrises(currentPage);
      setCrises(crisisData.data.results);
    } catch (err) {
      setError(err.response?.data?.detail || "Error submitting response");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Crisis Management</h1>

      <div className="">
        <div>
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-semibold mb-4">Existing Crisis</h2>
            <div className="">
              <button
                onClick={() => {
                  setShowModal(true);
                  setSelectedCrisis(null); // Reset to create a new crisis
                }}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Crisis
              </button>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="filter"
            >
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
                <li
                  key={crisis.id}
                  className="bg-white shadow-lg rounded-lg p-6"
                >
                  {crisis.image && (
                    <img
                      src={crisis.image}
                      className="mt-4 rounded-lg"
                      alt="crisis"
                    />
                  )}
                  <h2 className="text-2xl font-semibold mb-2">
                    {crisis.title}
                  </h2>
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
                  {crisis.responses.length > 0 && (
                    <div className="bg-gray-100 border border-gray-300 p-4 mt-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">
                        Volunteer Responses
                      </h3>
                      {crisis.responses.map((response) => (
                        <div
                          key={response.id}
                          className="mb-4 p-3 border border-blue-200 rounded-lg bg-blue-50"
                        >
                          <p className="text-blue-700 font-bold mb-1">
                            Volunteer Name: {response.volunteer_name}
                          </p>
                          <p className="text-gray-600 mb-1">
                            Message: {response.message}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Responded At:{" "}
                            {new Date(response.responded_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mb-2">
                    {crisis.status === "active" && role === "volunteer" && (
                      <button
                        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        onClick={() => {
                          setSelectedCrisis(crisis);
                          setShowResponseModal(true);
                        }}
                      >
                        Respond to Crisis
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setSelectedCrisis(crisis); // Set crisis to update
                    }}
                    className={`bg-yellow-500 text-white py-2 px-4 rounded-md mr-2 hover:bg-yellow-700 ${
                      token === null ? "hidden" : ""
                    }`}
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setSelectedCrisis(crisis); // Set crisis to delete
                    }}
                    className={`bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 ${
                      token === null ? "hidden" : ""
                    }`}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded-md mx-2"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-lg">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-md mx-2"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {showResponseModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Respond to Crisis</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {success && <p className="text-green-500 mb-4">{success}</p>}

              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="w-full p-2 border rounded-md mb-4"
                placeholder="Write your response here..."
              ></textarea>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespondToCrisis(selectedCrisis.id)}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Crisis Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">
                {selectedCrisis ? "Update Crisis" : "Add a New Crisis"}
              </h2>
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
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Description:</label>
                  <textarea
                    name="description"
                    value={newCrisis.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Required Help:</label>
                  <input
                    type="text"
                    name="required_help"
                    value={newCrisis.required_help}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Severity:</label>
                  <select
                    name="severity"
                    value={newCrisis.severity}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Status:</label>
                  <select
                    name="status"
                    value={newCrisis.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Image:</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {selectedCrisis ? "Update Crisis" : "Add Crisis"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Crisis Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Delete Crisis</h2>
              <p>Are you sure you want to delete this crisis?</p>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Crisis;
