// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { Tabs } from "antd";

// const { TabPane } = Tabs;

// const PlanningCommerciale = () => {
//   const [events, setEvents] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   // Fetch events from the backend
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await axios.get("/api/commerciale/events");
//         setEvents(response.data);
//       } catch (error) {
//         console.error("Error fetching events", error);
//       }
//     };
//     fetchEvents();
//   }, []);

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//   };

//   const handleDateClick = async (info) => {
//     // Function to handle clicks on dates in the calendar
//     const newEvent = {
//       title: "New Event",
//       start: info.dateStr,
//       end: info.dateStr,
//     };

//     try {
//       await axios.post("/api/commerciale/events", newEvent);
//       setEvents([...events, newEvent]);
//     } catch (error) {
//       console.error("Error creating new event", error);
//     }
//   };

//   return (
//     <div>

//       <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-center uppercase tracking-wide mb-10 shadow-md hover:scale-105 transition-transform duration-300">
//         Commerciale Calendar
//       </h1>
//       <Tabs defaultActiveKey="1">
//         <TabPane tab="Calendar View" key="1">
//           <FullCalendar
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//             initialView="dayGridMonth"
//             events={events}
//             dateClick={handleDateClick} // When a date is clicked, it adds a new event
//           />
//         </TabPane>
//         <TabPane tab="Pick a Date" key="2">
//           <DatePicker selected={selectedDate} onChange={handleDateChange} />
//         </TabPane>
//       </Tabs>
//     </div>
//   );
// };

// export default PlanningCommerciale;
import React, { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tabs, Modal, Input, Button } from "antd";

const { TabPane } = Tabs;

const PlanningCommerciale = () => {
  const [events, setEvents] = useState([]); // For storing events
  const [selectedDate, setSelectedDate] = useState(new Date()); // Selected date from DatePicker
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal state for adding tasks
  const [newEventTitle, setNewEventTitle] = useState(""); // For task title input

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://go-ko-9qul.onrender.com/api/commerciale/events"
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };
    fetchEvents();
  }, []);

  // When a date is clicked, show the modal to add a task
  const handleDateClick = (info) => {
    setSelectedDate(new Date(info.dateStr)); // Set clicked date
    setIsModalVisible(true); // Open modal
  };

  // Function to handle adding a new event
  const handleAddEvent = async () => {
    const newEvent = {
      title: newEventTitle || "New Task",
      start: selectedDate.toISOString(),
      end: selectedDate.toISOString(),
    };

    try {
      // Send the new event to the backend
      await axios.post(
        "https://go-ko-9qul.onrender.com/api/calendar",
        newEvent
      );
      // Update the event list
      setEvents([...events, newEvent]);
      // Close the modal and clear the input
      setIsModalVisible(false);
      setNewEventTitle("");
    } catch (error) {
      console.error("Error creating new event", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-center uppercase tracking-wide mb-10 shadow-md hover:scale-105 transition-transform duration-300">
        Commerciale Calendar
      </h1>

      {/* Ant Design Tabs for Calendar View and Date Picker */}
      <Tabs defaultActiveKey="1">
        {/* Calendar View Tab */}
        <TabPane tab="Calendar View" key="1">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
          />
        </TabPane>

        {/* Pick a Date Tab */}
        <TabPane tab="Pick a Date" key="2">
          <DatePicker selected={selectedDate} onChange={setSelectedDate} />
        </TabPane>
      </Tabs>

      {/* Modal for adding a new task */}
      <Modal
        title="Add New Task"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddEvent}>
            Add Task
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
