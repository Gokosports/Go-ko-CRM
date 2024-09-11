import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserFriends, faPersonSnowboarding, faUsers } from '@fortawesome/free-solid-svg-icons';
import ListCoach from './Coachs/ListCoach';
import Speciality from './Speciality';

import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Fix the import statement
import { Link } from 'react-router-dom';

function Dashboard() {
    const [counts, setCounts] = useState({ coaches: 0, clients: 0, specialties: 0 });
    const token = localStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : { name: '', role: '' };

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const response = await axios.get('https://go-ko.onrender.com/dash/counts', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCounts(response.data.data);
        } catch (error) {
            console.error('Error fetching counts', error);
        }
    };

    return (
        <>
            <div className="max-w-screen-lg mx-auto p-4 rounded-lg shadow-lg">
                <div className="mb-4 pb-2">
                    <div className="flex flex-wrap justify-between items-center mb-2">
                        <div className="w-full md:w-1/2">
                            <div>
                                <h1 className="mb-0 text-2xl font-bold">👋🏻 Bonjour {decodedToken.name}.</h1>
                                <p className="mb-0">Nous vous souhaitons une bonne journée</p>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-end items-center">
                            <img
                                src="src/assets/images/home.png"
                                alt="Home"
                                className="h-full w-auto max-h-40 lg:max-h-32 max-w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-center items-start mt-10">
                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
                    <Link to="/list-coachs">
                        <Card
                            title={
                                <div className="flex flex-col items-center mt-4">
                                    <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
                                        <FontAwesomeIcon icon={faUsers} className="text-white" />
                                    </div>
                                    <span className="mt-2">Coachs</span>
                                </div>
                            }
                            style={{ width: '80%' }}
                            className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
                        >
                            <p className="font-bold text-blue-900 text-4xl text-center">{counts.coaches}</p>
                        </Card>
                    </Link>
                </div>
                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
                    <Link to="/list-clients">
                        <Card
                            title={
                                <div className="flex flex-col items-center mt-4">
                                    <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
                                        <FontAwesomeIcon icon={faUserFriends} className="text-white" />
                                    </div>
                                    <span className="mt-2">Clients</span>
                                </div>
                            }
                            style={{ width: '80%' }}
                            className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
                        >
                            <p className="font-bold text-blue-900 text-4xl text-center">{counts.clients}</p>
                        </Card>
                    </Link>
                </div>
                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
                    <Link to="/speciality">
                        <Card
                            title={
                                <div className="flex flex-col items-center mt-4">
                                    <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
                                        <FontAwesomeIcon icon={faPersonSnowboarding} className="text-white" />
                                    </div>
                                    <span className="mt-2">Spécialités</span>
                                </div>
                            }
                            style={{ width: '80%' }}
                            className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
                        >
                            <p className="font-bold text-blue-900 text-4xl text-center">{counts.specialties}</p>
                        </Card>
                    </Link>
                </div>
            </div>

            <div className="flex flex-wrap justify-center items-start">
                <div className="w-full md:w-3/4 px-5 mt-10 mb-10 border rounded shadow-lg bg-white" style={{ height: '440px',width:'90%', overflowY: 'auto' }}>
                    <div className="p-2">
                        <ListCoach />
                    </div>
                </div>
                {/* <div className="w-full md:w-1/4 px-5 mt-10 mb-10 border rounded shadow-lg bg-white" style={{ height: '440px', overflowY: 'auto' }}>
                    <div className="p-6">
                        <Speciality/>
                    </div>
                </div> */}
            </div>
        </>
    );
}

export default Dashboard;
