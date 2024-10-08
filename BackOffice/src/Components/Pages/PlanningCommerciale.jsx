// import React, { useContext, useEffect, useState } from "react";
// import "react-datepicker/dist/react-datepicker.css";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import axios from "axios";
// import { LoginContext } from "../store/LoginContext";
// import { useNavigate, useParams } from "react-router-dom";

// const PlanningCommerciale = () => {
//   const {id: coachId} = useParams()
//   console.log('id', coachId)
//   const [plannings, setPlannings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const user = useContext(LoginContext);
//   const navigate = useNavigate();


//   const fetchPlannings = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `https://go-ko-9qul.onrender.com/api/planning`
//       );

//       const allPlannings = response.data;

//       const commercialName = user?.decodedToken?.name;
//       const [lastName, firstName] = commercialName?.trim().split(" ") || [];
//       const normalizedCommercialName = `${firstName} ${lastName}`;

//       const planning = allPlannings.filter(
//         (contract) => contract.commercialName === normalizedCommercialName
//       );
//       setPlannings(planning);
//       console.log('plplpl', planning)
//     } catch (error) {
//       console.error("Error fetching plannings:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPlannings();
//   }, []);

//   const formatEventsForCalendar = () => {
//     return plannings.map((planning) => ({
//       id: planning._id,
//       title: `${planning.callSituation} - ${planning.comment}`,
//       start: new Date(planning.time),
//       allDay: false,
//       coachId: planning.coachId
//     }));
//   };
  

//   return (
//     <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4">Your planning</h2>

//       {/* Full Calendar Display */}
//       <div className="mt-6">
//         <h3 className="text-xl font-semibold mb-2">Calendrier du coach</h3>
//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           initialView="dayGridMonth"
//           headerToolbar={{
//             left: "prev,next today",
//             center: "title",
//             right: "dayGridMonth,timeGridWeek,timeGridDay",
//           }}
//           events={formatEventsForCalendar()}
//           editable={true}
//           selectable={true}
         
//           // eventClick={(info) => alert(`Détails de l'événement: ${info.event.title} \nDate: ${info.event.start.toLocaleDateString()}`)}
//           eventClick={(info) => {
//             // Navigate to the planning details page with the event ID
//             navigate(`/coach/${coachId}/planningDetails`);
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default PlanningCommerciale;
import React, { useContext, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { LoginContext } from "../store/LoginContext";
import { useNavigate } from "react-router-dom";

const PlanningCommerciale = () => {
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useContext(LoginContext);
  const navigate = useNavigate();

  const fetchPlannings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/api/planning`
      );

      const allPlannings = response.data;

      const commercialName = user?.decodedToken?.name;
      const [lastName, firstName] = commercialName?.trim().split(" ") || [];
      const normalizedCommercialName = `${firstName} ${lastName}`;

      const planning = allPlannings.filter(
        (contract) => contract.commercialName === normalizedCommercialName
      );
      setPlannings(planning);
      console.log('plplpl', planning);
    } catch (error) {
      console.error("Error fetching plannings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannings();
  }, []);

  const formatEventsForCalendar = () => {
    return plannings.map((planning) => ({
      id: planning._id,
      title: `${planning.callSituation} - ${planning.comment}`,
      start: new Date(planning.time),
      allDay: false,
      coachId: planning.coachId // Ensure the coachId is included
    }));
  };

  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your planning</h2>

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
          eventClick={(info) => {
            // Get the coachId from the event's extendedProps
            const coachId = info.event.extendedProps.coachId;
            // Navigate to the planning details page with the coachId
            navigate(`/coach/${coachId}/planningDetails`);
          }}
        />
      </div>
    </div>
  );
};

export default PlanningCommerciale;
