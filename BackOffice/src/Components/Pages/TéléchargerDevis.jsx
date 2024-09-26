import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { LoginContext } from "../store/LoginContext";

const TéléchargerDevis = () => {
  const [contracts, setContracts] = useState([]);
  const user = useContext(LoginContext);
  console.log("User from Context:", user);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // Fetch all contracts
        const response = await axios.get("https://go-ko-9qul.onrender.com/api/contracts");
        const allContracts = response.data;

        const commercialName = user?.decodedToken?.name; // "Danguir Laila"

        // Split the name and rearrange
        const [lastName, firstName] = commercialName?.trim().split(" ") || [];
        const normalizedCommercialName = `${firstName} ${lastName}`; // "Laila Danguir"

        // Filter contracts for the current commercial
        const lailaContracts = allContracts.filter(
          (contract) => contract.commercialName === normalizedCommercialName
        );

        // Set contracts
        setContracts(lailaContracts);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContracts();
  }, [user]);

  const handleRedirect = (url) => {
    window.location.href = url;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Télécharger Contrats
      </h1>

      {/* Display the counter for contracts */}
      <h2 className="text-xl text-center mb-4">
        Nombre de contrats créés: {contracts.length}
      </h2>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-6 text-left font-medium text-gray-700">Nom</th>
            <th className="py-3 px-6 text-left font-medium text-gray-700">Commercial</th>
            <th className="py-3 px-6 text-left font-medium text-gray-700">Télécharger</th>
            <th className="py-3 px-6 text-left font-medium text-gray-700">Créé le</th>
            <th className="py-3 px-6 text-left font-medium text-gray-700">Mis à jour le</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length > 0 ? (
            contracts.map((contract) => (
              <tr
                key={contract._id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-6">{contract.fileName}</td>
                <td className="py-3 px-6">{contract.commercialName}</td>
                <td className="py-3 px-6">
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
                    onClick={() => handleRedirect(contract.fileUrl)}
                  >
                    Télécharger
                  </button>
                </td>
                <td className="py-3 px-6">
                  {new Date(contract.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-6">
                  {new Date(contract.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-3 px-6 text-center">
                Aucun contrat trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TéléchargerDevis;
