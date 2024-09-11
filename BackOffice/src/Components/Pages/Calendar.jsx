import React, { useState,useEffect } from 'react';
import { Calendar, Modal } from 'antd';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';

const MyCalendar = () => {
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvent] = useState([])
    const token = localStorage.getItem('token');
    const decodedUser =  token? jwtDecode(token):""
    const userLoged = decodedUser.userId

    useEffect(() => {
        
        fetchEvents()
    }, []);
    const fetchEvents = async ()=>{
        const responseDoc = await axios.get(`http://localhost:3000/consultation/doctor/${userLoged}`);
        const eventsWithColors = responseDoc.data.map(event => ({
            ...event,
            color: getColorForEvent(event) // Assign color dynamically
        }));
        setEvent(eventsWithColors);
    }

    const getColorForEvent = (event) => {
        const eventDateTime = moment(event.date_consultation);
        const now = moment();
        const oneHourFromNow = moment().add(3, 'hour');

        if (eventDateTime.isBefore(now)) {
            return 'blue'; // Event has passed
        } else if (eventDateTime.isBefore(oneHourFromNow)) {
            return 'red'; // Event is near (within the next hour)
        } else {
            return 'green'; // Event is in the future (beyond the next hour)
        }
    };

    const dateCellRender = (value) => {
        const matchingEvents = events.filter(event => value.isSame(new Date(event.date_consultation), 'day'));
        return matchingEvents.map((event, index) => (
            <div key={index}>
                <div className="border rounded px-2 py-1 block" style={{ backgroundColor: event.color, color: '#ffffff' }}>
                {new Date(event.date_consultation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.motif_consultation}
                </div>
            </div>
        ));
    };

    const handleSelect = (value) => {
        const matchingEvents = events.filter(event => value.isSame(new Date(event.date_consultation), 'day'));
        console.log("test",matchingEvents)
        setSelectedEvents(matchingEvents);
        setSelectedDate(value.toDate());
    };

    return (

        <div className="w-full mx-auto mt-1 max-w-screen">
            <h2 className="text-xl font-bold mb-4 text-start">Calendar</h2>
            <div className="border border-gray-300 rounded-lg p-4 shadow-md h-full">
            <div className="mb-4">
                <div className="flex space-x-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4" style={{ backgroundColor: '#FF0000' }}></div>
                        <span className="ml-2">Rendez-Vous Proche</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4" style={{ backgroundColor: 'green' }}></div>
                        <span className="ml-2">En Attente</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4" style={{ backgroundColor: 'blue' }}></div>
                        <span className="ml-2">Déjà Passé</span>
                    </div>
                </div>
            </div>
                <Calendar 
                    className="w-full h-full" 
                    style={{ maxWidth: '100%' }}
                    dateCellRender={dateCellRender}
                    fullscreen={true}
                    onSelect={handleSelect}
                />
            </div>
            <Modal
                title={selectedDate ? `Appointment : ${selectedDate.toLocaleDateString('en-EN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : "Rendez-Vous d'aujourd'hui"}
                visible={selectedEvents.length > 0}
                onCancel={() => {
                    setSelectedEvents([]);
                    setSelectedDate(null);
                }}
                footer={null}
            >
                {selectedEvents.map((event, index) => (
                    <div key={index} style={{ backgroundColor: event.color, color: '#FFFFFF', marginBottom: '8px', padding: '8px', borderRadius: '4px' }}>
                        {new Date(event.date_consultation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.motif_consultation}
                    </div>
                ))}
            </Modal>
        </div>
    );
}

export default MyCalendar;
