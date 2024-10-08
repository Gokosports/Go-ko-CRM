
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom"; // Import useParams to get the coachId from the URL
import { LoginContext } from "../store/LoginContext";
import { Tabs } from "antd";
import { jwtDecode } from "jwt-decode";
const { TabPane } = Tabs;
const PlanningDetails = () => {
  const { id: coachId } = useParams(); // Get the coachId from the URL
  const [planning, setPlanning] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useContext(LoginContext);
  
  const [activeTab, setActiveTab] = useState("1");
  const navigate = useNavigate();

  const fetchPlannings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://go-ko-9qul.onrender.com/api/planning/${coachId}` // Fetch the specific planning by coachId
      );
      const singlePlanning = response.data[0]; // Assuming the API returns an array, get the first item
      setPlanning(singlePlanning);
      console.log('Fetched Planning:', singlePlanning);
    } catch (error) {
      console.error("Error fetching planning details:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPlannings();
  }, [coachId]);

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (!planning) {
    return <div className="text-center text-red-600">No planning details found.</div>;
  }

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "2") {
        navigate(`/coaches/${coachId}`);
    } else if (key === "3") {
      navigate(`/CréerContrat/${coachId}`);
    } else if (key === "4") {
      navigate(`/planning/${coachId}`);
    } else {
        navigate(`/coach/${coachId}/planningDetails`);
    }
  };
  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Informations" key="2">
          {/* Add information tab content here */}
        </TabPane>
        <TabPane tab="Commentaire" key="1">
          {/* Add information tab content here */}
        </TabPane>
  
       
   
        <TabPane tab="Contrat" key="3">
          {/* Add information tab content here */}
        </TabPane>
        <TabPane tab="Planning" key="4">
         
        </TabPane>
      </Tabs>
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Planning Details</h2>
      <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
        
        <strong className="text-lg text-gray-700">Description:</strong> {planning.callSituation} - {planning.comment} <br />
        <strong className="text-lg text-gray-700">Date:</strong> {new Date(planning.time).toLocaleDateString()} <br />
        <strong className="text-lg text-gray-700">Coach Name:</strong> {planning.coachId.prenom} {planning.coachId.nom} <br />
        <strong className="text-lg text-gray-700">Commercial Name:</strong> {planning.commercialName} <br />
      </div>
    </div>
  );
};

export default PlanningDetails;
