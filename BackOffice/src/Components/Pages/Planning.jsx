
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Planning = () => {
  const [formData, setFormData] = useState({
    time: '',
    callSituation: '',
    comment: '',
  });

  const [plannings, setPlannings] = useState([]); // State for storing planning entries
  const [loading, setLoading] = useState(true); // State for loading status

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post('https://go-ko.onrender.com/api/planning', {
      ...formData,
    });
    console.log('Form Submitted:', response);

    // Fetch updated planning entries after submission
    fetchPlannings();

    setFormData({
      time: '',
      callSituation: '',
      comment: '',
    });
  };

  // Fetch planning entries on component mount
  const fetchPlannings = async () => {
    try {
      const response = await axios.get('https://go-ko.onrender.com/api/planning');
      setPlannings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plannings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannings();
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Planning for Coach</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Time Input */}
        <div className="form-group">
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time of Call:</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Call Situation Input */}
        <div className="form-group">
          <label htmlFor="callSituation" className="block text-sm font-medium text-gray-700">Call Situation:</label>
          <select
            id="callSituation"
            name="callSituation"
            value={formData.callSituation}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="">Select Situation</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

        {/* Comment Input */}
        <div className="form-group">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment:</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Add any comments here..."
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Submit Planning
        </button>
      </form>

      {/* Planning List */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Planning Entries</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {plannings.map((planning) => (
              <li key={planning._id} className="p-4 bg-white rounded-md shadow">
                <p><strong>Time:</strong> {planning.time}</p>
                <p><strong>Situation:</strong> {planning.callSituation}</p>
                <p><strong>Comment:</strong> {planning.comment}</p>
                <p className="text-sm text-gray-500">{new Date(planning.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Planning;
