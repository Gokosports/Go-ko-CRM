import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { LoginContext } from "../store/LoginContext";

const ValidateContract = () => {
    const [contracts, setContracts] = useState([]);
    const user = useContext(LoginContext);
  
    useEffect(() => {
      const fetchContracts = async () => {
        try {
          const response = await axios.get(
            "https://go-ko-9qul.onrender.com/api/contracts"
          );
          const allContracts = response.data.filter(
            (contract) => contract.status === "validé"
          );
  
          const commercialName = user?.decodedToken?.name;
          const [lastName, firstName] = commercialName?.trim().split(" ") || [];
          const normalizedCommercialName = `${firstName} ${lastName}`;
  
          const lailaContracts = allContracts.filter(
            (contract) => contract.commercialName === normalizedCommercialName
          );
  
          setContracts(lailaContracts);
        } catch (error) {
          console.error("Error fetching contracts:", error);
        }
      };
  
      fetchContracts();
    }, [user]);
  
    const handleRedirect = (url) => {
      window.open(url, "_blank");
    };
  
    // const extractPrice = (contractDuration) => {
    //   const priceMatch = contractDuration.match(/(\d+,\d+) €/);
    //   return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
    // };
    const extractPrice = (contractDuration) => {
      const priceMatch = contractDuration.match(/(\d+[\.,]?\d*)\s*€/); // Updated regex
      return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
    };
    const totalPrice = contracts.reduce((total, contract) => {
      return total + extractPrice(contract.contractDuration);
    }, 0);
  
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Validation des Contrats
        </h1>
  
        <h2 className="text-xl text-center text-gray-700 mb-4">
          Nombre de contrats validés:{" "}
          <span className="font-semibold">{contracts.length}</span>
          <br />
          Prix total TTC:{" "}
          <span className="font-semibold">{totalPrice.toFixed(2)} €</span>
        </h2>
  
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-6 text-left font-medium text-gray-700">
                ID
              </th>
              <th className="py-3 px-6 text-left font-medium text-gray-700">
                Commercial
              </th>
              <th className="py-3 px-6 text-left font-medium text-gray-700">
                Client Nom
              </th>
              <th className="py-3 px-6 text-left font-medium text-gray-700">
                Télécharger
              </th>
              <th className="py-3 px-6 text-left font-medium text-gray-700">
                Créé le
              </th>
              <th className="py-3 px-6 text-left font-medium text-gray-700">
                Prix TTC
              </th>
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
        <td className="py-3 px-6">{contract.clientName}</td>
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
          {extractPrice(contract.contractDuration).toFixed(2)} €
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="py-3 px-6 text-center text-gray-500">
        Aucun devis validé trouvé.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>
    );
  };

export default ValidateContract;