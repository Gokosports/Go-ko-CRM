import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Tabs, Modal, Input, Button, Spin } from "antd";
import { LoginContext } from "../store/LoginContext";

const { TabPane } = Tabs;

const PlanningCommerciale = () => {
  const { decodedToken } = useContext(LoginContext);
  console.log("decodedTokennnnnnnnnnn", decodedToken);
  const commercialId = decodedToken?.userId;
  console.log("commercialID grapped from token", commercialId);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async (commercialId) => {
    setLoading(true);
    setEvents([]); // Clear previous events when fetching new ones
    try {
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/api/calendar/${commercialId}`
      );
      if (Array.isArray(response.data)) {
        setEvents(response.data);
      }
      console.log("Fetched events:", response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (commercialId) {
      fetchEvents(commercialId);
    }
  }, [commercialId]);

  // Handle event click for editing
  const handleEventClick = (info) => {
    const clickedEvent = events.find((event) => event._id === info.event.id);
    if (clickedEvent) {
      setSelectedEventId(clickedEvent._id);
      setNewEventTitle(clickedEvent.title);
      setSelectedDate(new Date(clickedEvent.start));
      setIsModalVisible(true);
    }
  };

  // Add a new event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    const newEvent = {
      title: newEventTitle || "New Task",
      start: selectedDate.toISOString(),
      end: selectedDate.toISOString(),
      userId: commercialId,
    };

    try {
      const response = await axios.post(
        "https://go-ko-9qul.onrender.com/api/calendar",
        newEvent
      );
      setEvents((prevEvents) => [...prevEvents, response.data]);
      setIsModalVisible(false);
      setNewEventTitle("");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  // Update an existing event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const updatedEvent = {
      title: newEventTitle,
      start: selectedDate.toISOString(),
      end: selectedDate.toISOString(),
      userId: commercialId,
    };

    try {
      const response = await axios.put(
        `https://go-ko-9qul.onrender.com/api/calendar/${selectedEventId}`,
        updatedEvent
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === selectedEventId ? response.data : event
        )
      );
      setIsModalVisible(false);
      setNewEventTitle("");
      setSelectedEventId(null);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  // Delete an event
  const handleDeleteEvent = async () => {
    if (!selectedEventId) return;

    try {
      await axios.delete(
        `https://go-ko-9qul.onrender.com/api/calendar/${selectedEventId}`
      );
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== selectedEventId)
      );
      setIsModalVisible(false);
      setNewEventTitle("");
      setSelectedEventId(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-center uppercase tracking-wide mb-10 shadow-md hover:scale-105 transition-transform duration-300">
        Commerciale Calendar
      </h1>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Calendar View" key="1">
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            <FullCalendar
              key={commercialId}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={(info) => {
                setSelectedDate(new Date(info.dateStr));
                setIsModalVisible(true);
                setSelectedEventId(null);
              }}
              eventClick={handleEventClick} // Handle clicking on existing events
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
            />
          )}
        </TabPane>
      </Tabs>

      <Modal
        title={selectedEventId ? "Edit Task" : "Add New Task"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          selectedEventId && (
            <Button key="delete" danger onClick={handleDeleteEvent}>
              Delete
            </Button>
          ),
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={selectedEventId ? handleUpdateEvent : handleAddEvent}
          >
            {selectedEventId ? "Update Task" : "Add Task"}
          </Button>,
        ]}
      >
        <Input
          placeholder="Task Title"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PlanningCommerciale;
