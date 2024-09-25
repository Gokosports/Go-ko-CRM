import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Planning = () => {
  const { id: coachId } = useParams(); // Assuming coachId comes from URL params
  const [formData, setFormData] = useState({
    time: new Date(),
    callSituation: '',
    comment: '',
  });
  const [coach, setCoach] = useState(null);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch coach details
  const fetchCoach = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://go-ko.onrender.com/coaches/${coachId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCoach(response.data);
    } catch (error) {
      console.error('Error fetching coach:', error);
    }
  };

  // Submit new planning entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://go-ko.onrender.com/api/planning', {
        coachId,
        time: formData.time,
        callSituation: formData.callSituation,
        comment: formData.comment,
      });
      console.log('Form Submitted:', response);
      fetchPlannings(); // Refresh the planning list
      setFormData({
        time: new Date(),
        callSituation: '',
        comment: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Fetch plannings for the selected coach
  const fetchPlannings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://go-ko.onrender.com/api/planning/${coachId}`);
      setPlannings(response.data);
    } catch (error) {
      console.error('Error fetching plannings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle changes for the DatePicker
  const handleDateChange = (date) => {
    setFormData({ ...formData, time: date });
  };

  useEffect(() => {
    fetchCoach();
    fetchPlannings();
  }, [coachId]);

  // Format planning entries for the calendar
  const formatEventsForCalendar = () => {
    return plannings.map((planning) => ({
      id: planning._id,
      title: `${planning.callSituation} - ${planning.comment}`,
      start: new Date(planning.time),
      allDay: false,
    }));
  };

  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Créer un planning pour le coach</h2>

      {/* Display Coach's Name */}
      {coach && (
        <h3 className="text-lg font-semibold mb-4">
          Planning pour: {coach.prenom} {coach.nom}
        </h3>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date and Time Picker */}
        <div className="form-group">
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
          Sélectionner la date et l'heure :
          </label>
          <DatePicker
            selected={formData.time}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="MMMM d, yyyy h:mm aa"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        {/* Call Situation Input */}
        <div className="form-group">
          <label htmlFor="callSituation" className="block text-sm font-medium text-gray-700">
          Situation de l'appel :
          </label>
          <select
            id="callSituation"
            name="callSituation"
            value={formData.callSituation}
            onChange={(e) => setFormData({ ...formData, callSituation: e.target.value })}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="">Select Situation</option>
            <option value="Scheduled">Appel de vente</option>
            <option value="Completed">Négociation devis</option>
            <option value="Canceled">Conclusion vente</option>
            <option value="Canceled">Vente</option>
            <option value="Canceled">Appel de fidélisation</option>
            <option value="Canceled">Ne répond pas</option>
            <option value="Canceled">Faux numéro // Hors planning</option>
            <option value="Canceled">Ne pas déranger</option>
          </select>
        </div>

        {/* Comment Input */}
        <div className="w-full">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
            Comment:
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
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
          Soumettre le planning
        </button>
      </form>

      {/* Full Calendar Display */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Calendrier du coach</h3>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={formatEventsForCalendar()}
          editable={true}
          selectable={true}
          eventClick={(info) => alert(`Event: ${info.event.title}`)}
        />
      </div>
    </div>
  );
};

export default Planning;
