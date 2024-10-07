
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Button, Input, Tabs } from "antd";
import { jwtDecode } from "jwt-decode";

const { TabPane } = Tabs;

const Planning = () => {
  const { id: coachId } = useParams();
  const [formData, setFormData] = useState({
    time: new Date(),
    callSituation: "",
    comment: "",
    commercialName: "",
  });
  const [coach, setCoach] = useState(null);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null); // for edit/delete
  const [newEventTitle, setNewEventTitle] = useState("");

  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const userRole = decodedToken ? decodedToken.role : null;

  const fetchCoach = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/coaches/${coachId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCoach(response.data);
      const commercialName = response.data.commercial
        ? `${response.data.commercial.prenom} ${response.data.commercial.nom}`
        : "";
      setFormData((prevData) => ({
        ...prevData,
        commercialName: commercialName,
      }));
    } catch (error) {
      console.error("Error fetching coach:", error);
    }
  };

  const fetchPlannings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/api/planning/${coachId}`
      );
      setPlannings(response.data);
    } catch (error) {
      console.error("Error fetching plannings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEventId) {
        // Update (PUT)
        await axios.put(
          `https://go-ko-9qul.onrender.com/api/planning/${selectedEventId}`,
          {
            time: formData.time,
            callSituation: formData.callSituation,
            comment: formData.comment,
            commercialName: formData.commercialName,
          }
        );
      } else {
        // Add new event (POST)
        await axios.post("https://go-ko-9qul.onrender.com/api/planning", {
          coachId,
          time: formData.time,
          callSituation: formData.callSituation,
          comment: formData.comment,
          commercialName: formData.commercialName,
        });
      }

      fetchPlannings();
      setIsModalVisible(false);
      setFormData({
        time: new Date(),
        callSituation: "",
        comment: "",
        commercialName: "",
      });
      setSelectedEventId(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      if (selectedEventId) {
        await axios.delete(
          `https://go-ko-9qul.onrender.com/api/planning/${selectedEventId}`
        );
        fetchPlannings();
        setIsModalVisible(false);
        setSelectedEventId(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, time: date });
  };

  const formatEventsForCalendar = () => {
    return plannings.map((planning) => ({
      id: planning._id,
      title: `${planning.callSituation} - ${planning.comment}`,
      start: new Date(planning.time),
      allDay: false,
    }));
  };

  useEffect(() => {
    fetchCoach();
    fetchPlannings();
  }, [coachId]);

  const handleEventClick = (info) => {
    const event = plannings.find((p) => p._id === info.event.id);
    setFormData({
      time: new Date(event.time),
      callSituation: event.callSituation,
      comment: event.comment,
      commercialName: event.commercialName,
    });
    setSelectedEventId(event._id); // Set the selected event ID for editing
    setNewEventTitle(info.event.title);
    setIsModalVisible(true);
  };

  const renderCoachLink = () => {
    if (userRole === "Admin") {
      return <Link to={`/coach/${coachId}`}>Informations</Link>;
    } else if (userRole === "Commercial") {
      return <Link to={`/coaches/${coachId}`}>Informations</Link>;
    } else {
      return <span>Informations du Coach</span>;
    }
  };

  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md">
      <Tabs defaultActiveKey="4">
        <TabPane tab={renderCoachLink()} key="1"></TabPane>
        <TabPane
          tab={<Link to={`/coach/${coachId}/comments`}>Commentaires</Link>}
          key="2"
        ></TabPane>
        <TabPane
          tab={<Link to={`/CréerContrat/${coachId}`}>Contrat</Link>}
          key="3"
        ></TabPane>
        <TabPane
          tab={<Link to={`/planning/${coachId}`}>Planning</Link>}
          key="4"
        ></TabPane>
      </Tabs>

      <h2 className="text-2xl font-bold mb-4">
        Créer un planning pour le coach
      </h2>

      {coach && (
        <h3 className="text-lg font-semibold mb-4">
          Planning pour: {coach.prenom} {coach.nom}
        </h3>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date and Time Picker */}
        <div className="form-group">
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="callSituation"
            className="block text-sm font-medium text-gray-700"
          >
            Situation de l'appel :
          </label>
          <select
            id="callSituation"
            name="callSituation"
            value={formData.callSituation}
            onChange={(e) =>
              setFormData({ ...formData, callSituation: e.target.value })
            }
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="">Select Situation</option>
            <option value="Appel de vente">Appel de vente</option>
            <option value="Négociation devis">Négociation devis</option>
            <option value="Conclusion vente">Conclusion vente</option>
            <option value="Vente">Vente</option>
            <option value="Appel de fidélisation">Appel de fidélisation</option>
            <option value="Ne répond pas">Ne répond pas</option>
            <option value="Faux numéro // Hors planning">Faux numéro // Hors planning</option>
            <option value="Ne pas déranger">Ne pas déranger</option>
          </select>
        </div>

        {/* Comment Input */}
        <div className="w-full">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700"
          >
            Commentaire:
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
            placeholder="Ajoutez vos commentaires ici..."
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="commercialName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Commercial Name:
          </label>
          <input
            type="text"
            name="commercialName"
            id="commercialName"
            value={formData.commercialName}
            onChange={(e) =>
              setFormData({ ...formData, commercialName: e.target.value })
            }
            required
            readOnly
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 bg-gray-100"
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

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Calendrier du coach</h3>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={formatEventsForCalendar()}
          editable={true}
          selectable={true}
          eventClick={handleEventClick} // Handle event click
        />
      </div>

      {/* Modal for Add/Edit Task */}
      <Modal
        title={selectedEventId ? "Modifier la tâche" : "Ajouter une tâche"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedEventId(null);
        }}
        footer={[
          selectedEventId && (
            <Button key="delete" danger onClick={handleDeleteEvent}>
              Supprimer
            </Button>
          ),
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Annuler
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {selectedEventId ? "Mettre à jour" : "Ajouter"}
          </Button>,
        ]}
      >
        <Input
          placeholder="Titre de la tâche"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
        />
        <div className="mt-2">
          <label
            htmlFor="callSituation"
            className="block text-sm font-medium text-gray-700"
          >
            Situation de l'appel :
          </label>
          <select
            id="callSituation"
            name="callSituation"
            value={formData.callSituation}
            onChange={(e) =>
              setFormData({ ...formData, callSituation: e.target.value })
            }
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Situation</option>
            <option value="Appel de vente">Appel de vente</option>
            <option value="Négociation devis">Négociation devis</option>
            <option value="Conclusion vente">Conclusion vente</option>
            <option value="Vente">Vente</option>
            <option value="Appel de fidélisation">Appel de fidélisation</option>
            <option value="Ne répond pas">Ne répond pas</option>
            <option value="Faux numéro // Hors planning">Faux numéro // Hors planning</option>
            <option value="Ne pas dérange">Ne pas déranger</option>
          </select>
          <div className="w-full">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700"
          >
            Commentaire:
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
            placeholder="Ajoutez vos commentaires ici..."
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        </div>
      </Modal>
    </div>
  );
};

export default Planning;
