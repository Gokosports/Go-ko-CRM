// import React, { useContext, useEffect, useState } from "react";
// import { Card } from "antd";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUser,
//   faUserFriends,
//   faPersonSnowboarding,
//   faUsers,
// } from "@fortawesome/free-solid-svg-icons";
// import ListCoach from "./Coachs/ListCoach";
// import homeImage from "../../assets/images/home.png";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import { Link } from "react-router-dom";
// import { LoginContext } from "../store/LoginContext";
// import ListCoaches from "./Coachs/ListCoaches";

// function Dashboard() {
//   const [counts, setCounts] = useState({
//     coaches: 0,
//     clients: 0,
//     specialties: 0,
//   });
//   const [coaches, setCoaches] = useState([]);
//   const token = localStorage.getItem("token");
//   const decodedToken = token ? jwtDecode(token) : { name: "", role: "" };
//   const user = useContext(LoginContext);

//   useEffect(() => {
//     fetchCounts();
//     if (decodedToken.role === "Commercial") {
//       fetchAssignedCoaches(decodedToken.userId);
//     }
//   }, []);

//   const fetchCounts = async () => {
//     try {
//       const response = await axios.get(
//         "https://go-ko-9qul.onrender.com/dash/counts",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setCounts(response.data.data);
//     } catch (error) {
//       console.error("Error fetching counts", error);
//     }
//   };

//   const fetchAssignedCoaches = async (commercialId) => {
//     try {
//       const response = await axios.get(
//         `https://go-ko-9qul.onrender.com/coaches/assigned/${commercialId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setCoaches(response.data);
//       setCounts((prevCounts) => ({
//         ...prevCounts,
//         coaches: response.data.length, // Update coaches count to assigned coaches
//       }));
//     } catch (error) {
//       console.error("Error fetching assigned coaches", error);
//     }
//   };

//   const isAdmin =
//     decodedToken.role && decodedToken.role.toLowerCase() === "admin";

//     // Ensure case-insensitivity

//   return (
//     <>
//       <div className="max-w-screen-lg mx-auto p-4 rounded-lg shadow-lg">
//         <div className="mb-4 pb-2">
//           <div className="flex flex-wrap justify-between items-center mb-2">
//             <div className="w-full md:w-1/2">
//               <h1 className="mb-0 text-2xl font-bold">
//                 👋🏻 Bonjour {decodedToken.name}.
//               </h1>
//               <p className="mb-0">Nous vous souhaitons une bonne journée</p>
//             </div>
//             <div className="w-full md:w-1/2 flex justify-end items-center">
//               <img
//                 src={homeImage}
//                 alt="Home"
//                 className="h-full w-auto max-h-40 lg:max-h-32 max-w-full"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-wrap justify-center items-start mt-10">
//         <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
//           <Link to="/list-coachs">
//             <Card
//               title={
//                 <div className="flex flex-col items-center mt-4">
//                   <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
//                     <FontAwesomeIcon icon={faUsers} className="text-white" />
//                   </div>
//                   <span className="mt-2">Coachs</span>
//                 </div>
//               }
//               style={{ width: "80%" }}
//               className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
//             >
//               <p className="font-bold text-blue-900 text-4xl text-center">
//                 {counts.coaches}
//               </p>
//             </Card>
//           </Link>
//         </div>

//         {isAdmin && ( // Render Clients and Specialties only for Admin
//           <>
//             <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
//               <Link to="/list-clients">
//                 <Card
//                   title={
//                     <div className="flex flex-col items-center mt-4">
//                       <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
//                         <FontAwesomeIcon
//                           icon={faUserFriends}
//                           className="text-white"
//                         />
//                       </div>
//                       <span className="mt-2">Clients</span>
//                     </div>
//                   }
//                   style={{ width: "80%" }}
//                   className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
//                 >
//                   <p className="font-bold text-blue-900 text-4xl text-center">
//                     {counts.clients}
//                   </p>
//                 </Card>
//               </Link>
//             </div>
//             <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
//               <Link to="/speciality">
//                 <Card
//                   title={
//                     <div className="flex flex-col items-center mt-4">
//                       <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
//                         <FontAwesomeIcon
//                           icon={faPersonSnowboarding}
//                           className="text-white"
//                         />
//                       </div>
//                       <span className="mt-2">Spécialités</span>
//                     </div>
//                   }
//                   style={{ width: "80%" }}
//                   className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
//                 >
//                   <p className="font-bold text-blue-900 text-4xl text-center">
//                     {counts.specialties}
//                   </p>
//                 </Card>
//               </Link>
//             </div>
//           </>
//         )}
//       </div>

//       <div className="flex flex-wrap justify-center items-start">
//         <div
//           className="w-full  mt-10 mb-10 border rounded shadow-lg bg-white"
//           style={{ height: "440px", width: "100%", overflowY: "auto" }}
//         >
//           <div className="">
//           {decodedToken.role === "Admin" ? (
//         <ListCoach coaches={coaches} />
//       ) : decodedToken.role === "Commercial" ? (
//         <ListCoaches coaches={coaches} />
//       ) : null}

//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Dashboard;

import React, { useEffect, useState } from "react";
import { Card } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserFriends,
  faPersonSnowboarding,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import ListCoach from "./Coachs/ListCoach";
import homeImage from "../../assets/images/home.png";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import { LoginContext } from "../store/LoginContext";
import ListCoaches from "./Coachs/ListCoaches";

function Dashboard() {
  const [counts, setCounts] = useState({
    coaches: 0,
    clients: 0,
    specialties: 0,
  });
  const [coaches, setCoaches] = useState([]);
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : { name: "", role: "" };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch counts first
        const countsResponse = await axios.get(
          "https://go-ko-9qul.onrender.com/dash/counts",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCounts(countsResponse.data.data);

        if (decodedToken.role === "Commercial") {
          // Fetch assigned coaches only if user is a commercial
          const coachesResponse = await axios.get(
            `https://go-ko-9qul.onrender.com/coaches/assigned/${decodedToken.userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setCoaches(coachesResponse.data);
          // Set coach count to the number of assigned coaches
          setCounts((prevCounts) => ({
            ...prevCounts,
            coaches: coachesResponse.data.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // fetchAssignedCoaches(decodedToken.userId);
  }, [decodedToken.role, decodedToken.userId, token]);
  // useEffect(() => {

  //   if (decodedToken.role === "Commercial") {
  //     fetchAssignedCoaches(decodedToken.userId);
  //     fetchCounts(decodedToken.userId);
  //   } else {
  //     fetchCounts();
  //   }
  // }, []);

  // const fetchCounts = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(
  //       "https://go-ko-9qul.onrender.com/dash/counts",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     setCounts(response.data.data);
  //   } catch (error) {
  //     console.error("Error fetching counts", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchAssignedCoaches = async (commercialId) => {
  //   try {
  //     const response = await axios.get(
  //       `https://go-ko-9qul.onrender.com/coaches/assigned/${commercialId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     console.log('resposeassign', response.data)
  //     setCoaches(response.data);
  //     setCounts((prevCounts) => ({
  //       ...prevCounts,
  //       coaches: response.data.length, // Update coaches count to assigned coaches
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching assigned coaches", error);
  //   }
  // };

  const isAdmin =
    decodedToken.role && decodedToken.role.toLowerCase() === "admin";

  return (
    <>
      <div className="max-w-screen-lg mx-auto p-4 rounded-lg shadow-lg">
        <div className="mb-4 pb-2">
          <div className="flex flex-wrap justify-between items-center mb-2">
            <div className="w-full md:w-1/2">
              <h1 className="mb-0 text-2xl font-bold">
                👋🏻 Bonjour {decodedToken.name}.
              </h1>
              <p className="mb-0">Nous vous souhaitons une bonne journée</p>
            </div>
            <div className="w-full md:w-1/2 flex justify-end items-center">
              <img
                src={homeImage}
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
              style={{ width: "80%" }}
              className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
            >
              {loading ? (
                <p>Loading...</p>
              ) : (
                <p className="text-4xl font-bold text-blue-900 text-center">
                  {counts.coaches}
                </p>
              )}
            </Card>
          </Link>
        </div>

        {isAdmin && ( // Render Clients and Specialties only for Admin
          <>
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
              <Link to="/list-clients">
                <Card
                  title={
                    <div className="flex flex-col items-center mt-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
                        <FontAwesomeIcon
                          icon={faUserFriends}
                          className="text-white"
                        />
                      </div>
                      <span className="mt-2">Clients</span>
                    </div>
                  }
                  style={{ width: "80%" }}
                  className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
                >
                  <p className="font-bold text-blue-900 text-4xl text-center">
                    {counts.clients}
                  </p>
                </Card>
              </Link>
            </div>
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 mb-4 px-2">
              <Link to="/speciality">
                <Card
                  title={
                    <div className="flex flex-col items-center mt-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded bg-blue-500">
                        <FontAwesomeIcon
                          icon={faPersonSnowboarding}
                          className="text-white"
                        />
                      </div>
                      <span className="mt-2">Spécialités</span>
                    </div>
                  }
                  style={{ width: "80%" }}
                  className="transform transition-transform hover:scale-105 border-1 border-opacity-50 mx-auto shadow-lg"
                >
                  <p className="font-bold text-blue-900 text-4xl text-center">
                    {counts.specialties}
                  </p>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-center items-start">
        <div
          className="w-full mt-10 mb-10 border rounded shadow-lg bg-white"
          style={{ width: "100%" }}
        >
          <div className="">
            {decodedToken.role === "Admin" ? (
              <ListCoach coaches={coaches} />
            ) : decodedToken.role === "Commercial" ? (
              <ListCoaches coaches={coaches} />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
