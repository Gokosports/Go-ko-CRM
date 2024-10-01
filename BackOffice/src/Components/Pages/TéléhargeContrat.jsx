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
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContracts();
  }, []);

  const handleRedirect = (url) => {
    window.open(url, "_blank");
  };

  const extractPrice = (contractDuration) => {
    const priceMatch = contractDuration.match(/(\d+,\d+) €/);
    return priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : 0;
  };

  const totalPrice = filteredContracts?.reduce((total, contract) => {
    return total + extractPrice(contract.contractDuration);
  }, 0);

  const commercialTotalPrice = contracts.reduce((acc, contract) => {
    const commercialName = contract.commercialName;
    const price = extractPrice(contract.contractDuration);

    if (acc[commercialName]) {
      acc[commercialName] += price;
    } else {
      acc[commercialName] = price;
    }

    return acc;
  }, {});

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

      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-blue-100">
            {[
              "ID",
              "Commercial",
              "Client Nom",
              "Télécharger",
              "Créé le",
              "Prix TTC",
            ].map((header) => (
              <th
                key={header}
                className="py-4 px-6 text-left font-medium text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredContracts.map((contract) => (
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
          ))}
        </tbody>
      </table>

      <h2 className="text-xl text-center mt-8 mb-4 text-gray-800">
        Total par Commercial
      </h2>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-blue-100">
            <th className="py-4 px-6 text-left font-medium text-gray-700">
              Commercial
            </th>
            <th className="py-4 px-6 text-left font-medium text-gray-700">
              Prix total TTC
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(commercialTotalPrice).map(
            ([commercialName, price]) => (
              <tr
                key={commercialName}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-6">{commercialName}</td>
                <td className="py-3 px-6">{price.toFixed(2)} €</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TéléhargeContrat;
