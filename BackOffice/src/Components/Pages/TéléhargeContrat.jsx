import React, { useState, useEffect } from "react"; 
import axios from "axios";

const TéléhargeContrat = () => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(
          "https://go-ko-9qul.onrender.com/api/contracts"
        );
        console.log("All Contracts:", response.data);
        setContracts(response.data);
        setFilteredContracts(response.data);
        console.log("Fetched Contracts:", response.data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContracts();
  }, []);

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
  

  const totalPrice = filteredContracts?.reduce((total, contract) => {
    return total + extractPrice(contract.contractDuration);
  }, 0);

  const handleMonthFilter = (e) => {
    const selectedMonth = e.target.value;
    setSelectedMonth(selectedMonth);

    if (selectedMonth) {
      const filtered = contracts.filter((contract) => {
        const contractMonth = new Date(contract.createdAt).getMonth() + 1;
        return contractMonth === parseInt(selectedMonth);
      });
      setFilteredContracts(filtered);
    } else {
      setFilteredContracts(contracts);
    }
  };

  // Modify validation function to handle toggling
  const handleToggleContractStatus = async (contractId, currentStatus) => {
    try {
      const newStatus = currentStatus === "validé" ? "non validé" : "validé";

      await axios.patch(`https://go-ko-9qul.onrender.com/api/contracts/${contractId}`, {
        status: newStatus,
      });

      alert(`Le statut du contrat a été changé en ${newStatus} avec succès`);

      // Refetch contracts to reflect the update
      const response = await axios.get("https://go-ko-9qul.onrender.com/api/contracts");
      setContracts(response.data);
      setFilteredContracts(response.data);
    } catch (error) {
      console.error("Error updating contract status:", error);
    }
  };

  // Compute contracts summary by commercial
  const contractsSummary = filteredContracts.reduce((summary, contract) => {
    const commercialName = contract.commercialName;
    const price = extractPrice(contract.contractDuration);

    if (!summary[commercialName]) {
      summary[commercialName] = { count: 0, totalPrice: 0 };
    }
    summary[commercialName].count += 1;
    summary[commercialName].totalPrice += price;

    return summary;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Télécharger Contrats
      </h1>

      <div className="mb-6 flex justify-center items-center">
        <label
          htmlFor="month"
          className="mr-2 text-lg font-medium text-gray-700"
        >
          Filtrer par Mois
        </label>
        <select
          id="month"
          value={selectedMonth}
          onChange={handleMonthFilter}
          className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">Tous les mois</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-xl text-center mb-6 text-gray-800">
        Nombre de contrats créés: {filteredContracts.length}
        <br />
        Prix total TTC:{" "}
        <span className="font-bold">{totalPrice.toFixed(2)} €</span>
      </h2>

      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg mb-8">
        <thead>
          <tr className="bg-blue-100">
            {["ID", "Commercial", "Client Nom", "Télécharger", "Créé le", "Prix TTC", "Actions"].map((header) => (
              <th key={header} className="py-4 px-6 text-left font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredContracts.map((contract) => (
            <tr key={contract._id} className="border-t border-gray-200 hover:bg-gray-50">
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
              <td className="py-3 px-6">{new Date(contract.createdAt).toLocaleString()}</td>
              <td className="py-3 px-6">{extractPrice(contract.contractDuration).toFixed(2)} €</td>
              <td className="py-3 px-6">
                <button
                  className={`bg-${contract.status === "validé" ? "red" : "green"}-500 text-white py-2 px-4 rounded-md hover:bg-${contract.status === "validé" ? "red" : "green"}-600 transition-all`}
                  onClick={() => handleToggleContractStatus(contract._id, contract.status)}
                >
                  {contract.status === "validé" ? "Non Validé" : "Valider"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Table for Contracts by Commercial */}
      <h2 className="text-2xl text-center mb-6 text-gray-800">
        Résumé des Contrats par Commercial
      </h2>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-blue-100">
            <th className="py-4 px-6 text-left font-medium text-gray-700">Commercial</th>
            <th className="py-4 px-6 text-left font-medium text-gray-700">Nombre de Contrats</th>
            <th className="py-4 px-6 text-left font-medium text-gray-700">Prix Total (€)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(contractsSummary).map(([commercial, { count, totalPrice }]) => (
            <tr key={commercial} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6">{commercial}</td>
              <td className="py-3 px-6">{count}</td>
              <td className="py-3 px-6">{totalPrice.toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TéléhargeContrat;




























// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const TéléhargeContrat = () => {
//   const [contracts, setContracts] = useState([]);
//   const [filteredContracts, setFilteredContracts] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState(""); // State to store the selected month

//   useEffect(() => {
//     // Fetch contracts data from your API
//     const fetchContracts = async () => {
//       try {
//         const response = await axios.get(
//           "https://go-ko-9qul.onrender.com/api/contracts"
//         );
//         console.log("All Contracts:", response.data);
//         setContracts(response.data);
//         setFilteredContracts(response.data); // Initially, show all contracts
//       } catch (error) {
//         console.error("Error fetching contracts:", error);
//       }
//     };

//     fetchContracts();
//   }, []);

//   const handleRedirect = (url) => {
//     window.location.href = url;
//   };

//   const extractPrice = (contractDuration) => {
//     // Example contractDuration format: "24 mois - 54,90 € par mois"
//     const priceMatch = contractDuration.match(/(\d+,\d+) €/);
//     return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
//   };

//   // Calculate the total price for all contracts
//   const totalPrice = filteredContracts.reduce((total, contract) => {
//     return total + extractPrice(contract.contractDuration);
//   }, 0);

//   // Group contracts by commercial and calculate the total price for each commercial
//   const commercialTotalPrice = contracts.reduce((acc, contract) => {
//     const commercialName = contract.commercialName;
//     const price = extractPrice(contract.contractDuration);

//     if (acc[commercialName]) {
//       acc[commercialName] += price;
//     } else {
//       acc[commercialName] = price;
//     }

//     return acc;
//   }, {});

//   // Handle the month filter
//   const handleMonthFilter = (e) => {
//     const selectedMonth = e.target.value;
//     setSelectedMonth(selectedMonth);

//     if (selectedMonth) {
//       const filtered = contracts.filter((contract) => {
//         const contractMonth = new Date(contract.createdAt).getMonth() + 1; // getMonth() returns 0-11
//         return contractMonth === parseInt(selectedMonth);
//       });
//       setFilteredContracts(filtered);
//     } else {
//       // If no month is selected, reset to show all contracts
//       setFilteredContracts(contracts);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-2xl font-bold text-center mb-6">
//         Télécharger Contrats
//       </h1>

//       {/* Month Filter */}
//       <div className="mb-4 flex justify-center">
//         <label htmlFor="month" className="mr-2">
//         Filtrer par Mois
//         </label>
//         <select
//           id="month"
//           value={selectedMonth}
//           onChange={handleMonthFilter}
//           className="border px-2 py-1 rounded"
//         >
//           <option value="">All Months</option>
//           <option value="1">January</option>
//           <option value="2">February</option>
//           <option value="3">March</option>
//           <option value="4">April</option>
//           <option value="5">May</option>
//           <option value="6">June</option>
//           <option value="7">July</option>
//           <option value="8">August</option>
//           <option value="9">September</option>
//           <option value="10">October</option>
//           <option value="11">November</option>
//           <option value="12">December</option>
//         </select>
//       </div>

//       {/* Total contracts and total price */}
//       <h2 className="text-xl text-center mb-4">
//         Nombre de contrats créés: {filteredContracts.length}
//         <br />
//         Prix total TTC: {totalPrice.toFixed(2)} €
//       </h2>

//       {/* First table for all contracts */}
//       <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               ID
//             </th>
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               Commercial
//             </th>
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               Client Nom
//             </th>
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               Télécharger
//             </th>
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               Créé le
//             </th>
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               Price TTC
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredContracts.map((contract) => (
//             <tr
//               key={contract._id}
//               className="border-t border-gray-200 hover:bg-gray-50"
//             >
//               <td className="py-3 px-6">{contract.fileName}</td>
//               <td className="py-3 px-6">{contract.commercialName}</td>
//               <td className="py-3 px-6">{contract.clientName}</td>
//               <td className="py-3 px-6">
//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
//                   onClick={() => handleRedirect(contract.fileUrl)}
//                 >
//                   Télécharger
//                 </button>
//               </td>
//               <td className="py-3 px-6">
//                 {new Date(contract.createdAt).toLocaleString()}
//               </td>
//               <td className="py-3 px-6">
//                 {extractPrice(contract.contractDuration).toFixed(2)} €
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* New table for total price per commercial */}
//       <h2 className="text-xl text-center mt-6 mb-4">Total par Commercial</h2>
//       <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               Commercial
//             </th>
//             <th className="py-3 px-6 text-left font-medium text-gray-700">
//               Prix total TTC
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.entries(commercialTotalPrice).map(
//             ([commercialName, price]) => (
//               <tr
//                 key={commercialName}
//                 className="border-t border-gray-200 hover:bg-gray-50"
//               >
//                 <td className="py-3 px-6">{commercialName}</td>
//                 <td className="py-3 px-6">{price.toFixed(2)} €</td>
//               </tr>
//             )
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TéléhargeContrat;



// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const TéléhargeContrat = () => {
//   const [contracts, setContracts] = useState([]);
//   const [filteredContracts, setFilteredContracts] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchContracts = async () => {
//       try {
//         const response = await axios.get(
//           "https://go-ko-9qul.onrender.com/api/contracts"
//         );
//         console.log("All Contracts:", response.data);
//         setContracts(response.data);
//         setFilteredContracts(response.data);
//       } catch (error) {
//         console.error("Error fetching contracts:", error);
//       }
//     };

//     fetchContracts();
//   }, []);

//   const handleRedirect = (url) => {
//     window.open(url, "_blank");
//   };

//   const extractPrice = (contractDuration) => {
//     const priceMatch = contractDuration.match(/(\d+,\d+) €/);
//     return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
//   };

//   const totalPrice = filteredContracts?.reduce((total, contract) => {
//     return total + extractPrice(contract.contractDuration);
//   }, 0);

//   const commercialTotalPrice = contracts.reduce((acc, contract) => {
//     const commercialName = contract.commercialName;
//     const price = extractPrice(contract.contractDuration);

//     if (acc[commercialName]) {
//       acc[commercialName] += price;
//     } else {
//       acc[commercialName] = price;
//     }

//     return acc;
//   }, {});

//   const handleMonthFilter = (e) => {
//     const selectedMonth = e.target.value;
//     setSelectedMonth(selectedMonth);

//     if (selectedMonth) {
//       const filtered = contracts.filter((contract) => {
//         const contractMonth = new Date(contract.createdAt).getMonth() + 1;
//         return contractMonth === parseInt(selectedMonth);
//       });
//       setFilteredContracts(filtered);
//     } else {
//       setFilteredContracts(contracts);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
//       <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
//         Télécharger Contrats
//       </h1>

//       <div className="mb-6 flex justify-center items-center">
//         <label
//           htmlFor="month"
//           className="mr-2 text-lg font-medium text-gray-700"
//         >
//           Filtrer par Mois
//         </label>
//         <select
//           id="month"
//           value={selectedMonth}
//           onChange={handleMonthFilter}
//           className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
//         >
//           <option value="">Tous les mois</option>
//           {[...Array(12)].map((_, i) => (
//             <option key={i + 1} value={i + 1}>
//               {new Date(0, i).toLocaleString("default", { month: "long" })}
//             </option>
//           ))}
//         </select>
//       </div>

//       <h2 className="text-xl text-center mb-6 text-gray-800">
//         Nombre de contrats créés: {filteredContracts.length}
//         <br />
//         Prix total TTC:{" "}
//         <span className="font-bold">{totalPrice.toFixed(2)} €</span>
//       </h2>

//       <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
//         <thead>
//           <tr className="bg-blue-100">
//             {[
//               "ID",
//               "Commercial",
//               "Client Nom",
//               "Télécharger",
//               "Créé le",
//               "Prix TTC",
//             ].map((header) => (
//               <th
//                 key={header}
//                 className="py-4 px-6 text-left font-medium text-gray-700"
//               >
//                 {header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredContracts.map((contract) => (
//             <tr
//               key={contract._id}
//               className="border-t border-gray-200 hover:bg-gray-50"
//             >
//               <td className="py-3 px-6">{contract.fileName}</td>
//               <td className="py-3 px-6">{contract.commercialName}</td>
//               <td className="py-3 px-6">{contract.clientName}</td>
//               <td className="py-3 px-6">
//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
//                   onClick={() => handleRedirect(contract.fileUrl)}
//                 >
//                   Télécharger
//                 </button>
//               </td>
//               <td className="py-3 px-6">
//                 {new Date(contract.createdAt).toLocaleString()}
//               </td>
//               <td className="py-3 px-6">
//                 {extractPrice(contract.contractDuration).toFixed(2)} €
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <h2 className="text-xl text-center mt-8 mb-4 text-gray-800">
//         Total par Commercial
//       </h2>
//       <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
//         <thead>
//           <tr className="bg-blue-100">
//             <th className="py-4 px-6 text-left font-medium text-gray-700">
//               Commercial
//             </th>
//             <th className="py-4 px-6 text-left font-medium text-gray-700">
//               Prix total TTC
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.entries(commercialTotalPrice).map(
//             ([commercialName, price]) => (
//               <tr
//                 key={commercialName}
//                 className="border-t border-gray-200 hover:bg-gray-50"
//               >
//                 <td className="py-3 px-6">{commercialName}</td>
//                 <td className="py-3 px-6">{price.toFixed(2)} €</td>
//               </tr>
//             )
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TéléhargeContrat;



























// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const TéléhargeContrat = () => {
//   const [contracts, setContracts] = useState([]);
//   const [filteredContracts, setFilteredContracts] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchContracts = async () => {
//       try {
//         const response = await axios.get(
//           "https://go-ko-9qul.onrender.com/api/contracts"
//         );
//         console.log("All Contracts:", response.data);
//         setContracts(response.data);
//         setFilteredContracts(response.data);
//       } catch (error) {
//         console.error("Error fetching contracts:", error);
//       }
//     };

//     fetchContracts();
//   }, []);

//   const handleRedirect = (url) => {
//     window.open(url, "_blank");
//   };

//   const extractPrice = (contractDuration) => {
//     const priceMatch = contractDuration.match(/(\d+,\d+) €/);
//     return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
//   };

//   const totalPrice = filteredContracts?.reduce((total, contract) => {
//     return total + extractPrice(contract.contractDuration);
//   }, 0);

//   const handleMonthFilter = (e) => {
//     const selectedMonth = e.target.value;
//     setSelectedMonth(selectedMonth);

//     if (selectedMonth) {
//       const filtered = contracts.filter((contract) => {
//         const contractMonth = new Date(contract.createdAt).getMonth() + 1;
//         return contractMonth === parseInt(selectedMonth);
//       });
//       setFilteredContracts(filtered);
//     } else {
//       setFilteredContracts(contracts);
//     }
//   };

//   // Add validation function
//   const handleValidateContract = async (contractId) => {
//     try {
//       await axios.patch(`https://go-ko-9qul.onrender.com/api/contracts/${contractId}`, {
//         status: "validé",
//       });
//       alert("Contract validated successfully");
//       // Refetch contracts to reflect the update
//       const response = await axios.get("https://go-ko-9qul.onrender.com/api/contracts");
//       setContracts(response.data);
//       setFilteredContracts(response.data);
//     } catch (error) {
//       console.error("Error validating contract:", error);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
//       <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
//         Télécharger Contrats
//       </h1>

//       <div className="mb-6 flex justify-center items-center">
//         <label
//           htmlFor="month"
//           className="mr-2 text-lg font-medium text-gray-700"
//         >
//           Filtrer par Mois
//         </label>
//         <select
//           id="month"
//           value={selectedMonth}
//           onChange={handleMonthFilter}
//           className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
//         >
//           <option value="">Tous les mois</option>
//           {[...Array(12)].map((_, i) => (
//             <option key={i + 1} value={i + 1}>
//               {new Date(0, i).toLocaleString("default", { month: "long" })}
//             </option>
//           ))}
//         </select>
//       </div>

//       <h2 className="text-xl text-center mb-6 text-gray-800">
//         Nombre de contrats créés: {filteredContracts.length}
//         <br />
//         Prix total TTC:{" "}
//         <span className="font-bold">{totalPrice.toFixed(2)} €</span>
//       </h2>

//       <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
//         <thead>
//           <tr className="bg-blue-100">
//             {["ID", "Commercial", "Client Nom", "Télécharger", "Créé le", "Prix TTC", "Actions"].map((header) => (
//               <th key={header} className="py-4 px-6 text-left font-medium text-gray-700">
//                 {header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredContracts.map((contract) => (
//             <tr key={contract._id} className="border-t border-gray-200 hover:bg-gray-50">
//               <td className="py-3 px-6">{contract.fileName}</td>
//               <td className="py-3 px-6">{contract.commercialName}</td>
//               <td className="py-3 px-6">{contract.clientName}</td>
//               <td className="py-3 px-6">
//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
//                   onClick={() => handleRedirect(contract.fileUrl)}
//                 >
//                   Télécharger
//                 </button>
//               </td>
//               <td className="py-3 px-6">{new Date(contract.createdAt).toLocaleString()}</td>
//               <td className="py-3 px-6">{extractPrice(contract.contractDuration).toFixed(2)} €</td>
//               <td className="py-3 px-6">
//                 {contract.status !== "validé" && (
//                   <button
//                     className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-all"
//                     onClick={() => handleValidateContract(contract._id)}
//                   >
//                     Valider
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TéléhargeContrat;

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const TéléhargeContrat = () => {
//   const [contracts, setContracts] = useState([]);
//   const [filteredContracts, setFilteredContracts] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchContracts = async () => {
//       try {
//         const response = await axios.get(
//           "https://go-ko-9qul.onrender.com/api/contracts"
//         );
//         console.log("All Contracts:", response.data);
//         setContracts(response.data);
//         setFilteredContracts(response.data);
//       } catch (error) {
//         console.error("Error fetching contracts:", error);
//       }
//     };

//     fetchContracts();
//   }, []);

//   const handleRedirect = (url) => {
//     window.open(url, "_blank");
//   };

//   const extractPrice = (contractDuration) => {
//     const priceMatch = contractDuration.match(/(\d+,\d+) €/);
//     return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
//   };

//   const totalPrice = filteredContracts?.reduce((total, contract) => {
//     return total + extractPrice(contract.contractDuration);
//   }, 0);

//   const handleMonthFilter = (e) => {
//     const selectedMonth = e.target.value;
//     setSelectedMonth(selectedMonth);

//     if (selectedMonth) {
//       const filtered = contracts.filter((contract) => {
//         const contractMonth = new Date(contract.createdAt).getMonth() + 1;
//         return contractMonth === parseInt(selectedMonth);
//       });
//       setFilteredContracts(filtered);
//     } else {
//       setFilteredContracts(contracts);
//     }
//   };

//   // Add validation function
//   const handleValidateContract = async (contractId) => {
//     try {
//       await axios.patch(`https://go-ko-9qul.onrender.com/api/contracts/${contractId}`, {
//         status: "validé",
//       });
//       alert("Contract validated successfully");
//       // Refetch contracts to reflect the update
//       const response = await axios.get("https://go-ko-9qul.onrender.com/api/contracts");
//       setContracts(response.data);
//       setFilteredContracts(response.data);
//     } catch (error) {
//       console.error("Error validating contract:", error);
//     }
//   };

//   // Aggregate data for commercial contracts
//   const aggregateCommercialData = () => {
//     const commercialData = {};

//     filteredContracts.forEach(contract => {
//       const commercialName = contract.commercialName;
//       const price = extractPrice(contract.contractDuration);

//       if (!commercialData[commercialName]) {
//         commercialData[commercialName] = { totalContracts: 0, totalPrice: 0 };
//       }

//       commercialData[commercialName].totalContracts += 1;
//       commercialData[commercialName].totalPrice += price;
//     });

//     return commercialData;
//   };

//   const commercialData = aggregateCommercialData();

//   return (
//     <div className="max-w-6xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
//       <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
//         Télécharger Contrats
//       </h1>

//       <div className="mb-6 flex justify-center items-center">
//         <label
//           htmlFor="month"
//           className="mr-2 text-lg font-medium text-gray-700"
//         >
//           Filtrer par Mois
//         </label>
//         <select
//           id="month"
//           value={selectedMonth}
//           onChange={handleMonthFilter}
//           className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
//         >
//           <option value="">Tous les mois</option>
//           {[...Array(12)].map((_, i) => (
//             <option key={i + 1} value={i + 1}>
//               {new Date(0, i).toLocaleString("default", { month: "long" })}
//             </option>
//           ))}
//         </select>
//       </div>

//       <h2 className="text-xl text-center mb-6 text-gray-800">
//         Nombre de contrats créés: {filteredContracts.length}
//         <br />
//         Prix total TTC:{" "}
//         <span className="font-bold">{totalPrice.toFixed(2)} €</span>
//       </h2>

//       {/* First table for contracts */}
//       <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg mb-8">
//         <thead>
//           <tr className="bg-blue-100">
//             {["ID", "Commercial", "Client Nom", "Télécharger", "Créé le", "Prix TTC", "Actions"].map((header) => (
//               <th key={header} className="py-4 px-6 text-left font-medium text-gray-700">
//                 {header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredContracts.map((contract) => (
//             <tr key={contract._id} className="border-t border-gray-200 hover:bg-gray-50">
//               <td className="py-3 px-6">{contract.fileName}</td>
//               <td className="py-3 px-6">{contract.commercialName}</td>
//               <td className="py-3 px-6">{contract.clientName}</td>
//               <td className="py-3 px-6">
//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
//                   onClick={() => handleRedirect(contract.fileUrl)}
//                 >
//                   Télécharger
//                 </button>
//               </td>
//               <td className="py-3 px-6">{new Date(contract.createdAt).toLocaleString()}</td>
//               <td className="py-3 px-6">{extractPrice(contract.contractDuration).toFixed(2)} €</td>
//               <td className="py-3 px-6">
//                 {contract.status !== "validé" && (
//                   <button
//                     className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-all"
//                     onClick={() => handleValidateContract(contract._id)}
//                   >
//                     Valider
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Second table for commercial summary */}
//       <h2 className="text-2xl text-center mb-4 text-gray-800">
//         Résumé des contrats par commercial
//       </h2>
//       <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
//         <thead>
//           <tr className="bg-blue-100">
//             <th className="py-4 px-6 text-left font-medium text-gray-700">Commercial</th>
//             <th className="py-4 px-6 text-left font-medium text-gray-700">Nombre de Contrats</th>
//             <th className="py-4 px-6 text-left font-medium text-gray-700">Prix Total TTC</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.entries(commercialData).map(([commercialName, data]) => (
//             <tr key={commercialName} className="border-t border-gray-200 hover:bg-gray-50">
//               <td className="py-3 px-6">{commercialName}</td>
//               <td className="py-3 px-6">{data.totalContracts}</td>
//               <td className="py-3 px-6">{data.totalPrice.toFixed(2)} €</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TéléhargeContrat;


// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const TéléhargeContrat = () => {
//   const [contracts, setContracts] = useState([]);
//   const [filteredContracts, setFilteredContracts] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     const fetchContracts = async () => {
//       try {
//         const response = await axios.get(
//           "https://go-ko-9qul.onrender.com/api/contracts"
//         );
//         console.log("All Contracts:", response.data);
//         setContracts(response.data);
//         setFilteredContracts(response.data);
//       } catch (error) {
//         console.error("Error fetching contracts:", error);
//       }
//     };

//     fetchContracts();
//   }, []);

//   const handleRedirect = (url) => {
//     window.open(url, "_blank");
//   };

//   const extractPrice = (contractDuration) => {
//     const priceMatch = contractDuration.match(/(\d+,\d+) €/);
//     return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
//   };

//   const totalPrice = filteredContracts?.reduce((total, contract) => {
//     return total + extractPrice(contract.contractDuration);
//   }, 0);

//   const handleMonthFilter = (e) => {
//     const selectedMonth = e.target.value;
//     setSelectedMonth(selectedMonth);

//     if (selectedMonth) {
//       const filtered = contracts.filter((contract) => {
//         const contractMonth = new Date(contract.createdAt).getMonth() + 1;
//         return contractMonth === parseInt(selectedMonth);
//       });
//       setFilteredContracts(filtered);
//     } else {
//       setFilteredContracts(contracts);
//     }
//   };

//   // Modify validation function to handle toggling
//   const handleToggleContractStatus = async (contractId, currentStatus) => {
//     try {
//       const newStatus = currentStatus === "validé" ? "non validé" : "validé";

//       await axios.patch(`https://go-ko-9qul.onrender.com/api/contracts/${contractId}`, {
//         status: newStatus,
//       });

//       alert(`Contract status changed to ${newStatus} successfully`);

//       // Refetch contracts to reflect the update
//       const response = await axios.get("https://go-ko-9qul.onrender.com/api/contracts");
//       setContracts(response.data);
//       setFilteredContracts(response.data);
//     } catch (error) {
//       console.error("Error updating contract status:", error);
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
//       <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
//         Télécharger Contrats
//       </h1>

//       <div className="mb-6 flex justify-center items-center">
//         <label
//           htmlFor="month"
//           className="mr-2 text-lg font-medium text-gray-700"
//         >
//           Filtrer par Mois
//         </label>
//         <select
//           id="month"
//           value={selectedMonth}
//           onChange={handleMonthFilter}
//           className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
//         >
//           <option value="">Tous les mois</option>
//           {[...Array(12)].map((_, i) => (
//             <option key={i + 1} value={i + 1}>
//               {new Date(0, i).toLocaleString("default", { month: "long" })}
//             </option>
//           ))}
//         </select>
//       </div>

//       <h2 className="text-xl text-center mb-6 text-gray-800">
//         Nombre de contrats créés: {filteredContracts.length}
//         <br />
//         Prix total TTC:{" "}
//         <span className="font-bold">{totalPrice.toFixed(2)} €</span>
//       </h2>

//       <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
//         <thead>
//           <tr className="bg-blue-100">
//             {["ID", "Commercial", "Client Nom", "Télécharger", "Créé le", "Prix TTC", "Actions"].map((header) => (
//               <th key={header} className="py-4 px-6 text-left font-medium text-gray-700">
//                 {header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {filteredContracts.map((contract) => (
//             <tr key={contract._id} className="border-t border-gray-200 hover:bg-gray-50">
//               <td className="py-3 px-6">{contract.fileName}</td>
//               <td className="py-3 px-6">{contract.commercialName}</td>
//               <td className="py-3 px-6">{contract.clientName}</td>
//               <td className="py-3 px-6">
//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
//                   onClick={() => handleRedirect(contract.fileUrl)}
//                 >
//                   Télécharger
//                 </button>
//               </td>
//               <td className="py-3 px-6">{new Date(contract.createdAt).toLocaleString()}</td>
//               <td className="py-3 px-6">{extractPrice(contract.contractDuration).toFixed(2)} €</td>
//               <td className="py-3 px-6">
//                 <button
//                   className={`bg-${contract.status === "validé" ? "red" : "green"}-500 text-white py-2 px-4 rounded-md hover:bg-${contract.status === "validé" ? "red" : "green"}-600 transition-all`}
//                   onClick={() => handleToggleContractStatus(contract._id, contract.status)}
//                 >
//                   {contract.status === "validé" ? "Non Validé" : "Valider"}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TéléhargeContrat;




