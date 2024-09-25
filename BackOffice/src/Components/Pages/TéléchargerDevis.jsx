import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TéléchargerDevis = () => {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    // Fetch contracts data from your API
    const fetchContracts = async () => {
      try {
        const response = await axios.get('https://go-ko.onrender.com/api/devis');
        setContracts(response.data);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      }
    };

    fetchContracts();
  }, []);

  const handleRedirect = (url) => {
    window.location.href = url;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Télécharger Devis</h1>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-6 text-left font-medium text-gray-700">Nom</th>
            <th className="py-3 px-6 text-left font-medium text-gray-700">Télécharger</th>
            <th className="py-3 px-6 text-left font-medium text-gray-700">Créé le</th>
            <th className="py-3 px-6 text-left font-medium text-gray-700">Mis à jour le</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map(contract => (
            <tr key={contract._id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6">{contract.fileName}</td>
              <td className="py-3 px-6">
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
                  onClick={() => handleRedirect(contract.fileUrl)}
                >
                  Télécharger
                </button>
              </td>
              <td className="py-3 px-6">{new Date(contract.createdAt).toLocaleString()}</td>
              <td className="py-3 px-6">{new Date(contract.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TéléchargerDevis;
