// import React, { createContext } from "react";
// import { jwtDecode } from 'jwt-decode';
// export const LoginContext = createContext();

// export const LoginProvider = ({ children }) => {
//     const token = localStorage.getItem('token');
//     const decodedToken = token ? jwtDecode(token) : "";
//     const isLoggedIn = () => {
//         const token = localStorage.getItem('token');
//         // Check if a token exists
//         if (token) {
//             try {
//                 //decode the token
//                 const currentTime = Date.now() / 1000; // Convert to seconds
//                 if (decodedToken.exp < currentTime) {
//                     console.log('Token expired')
//                     return false;
//                 }
//                 return true;
//             } catch (error) {
//                 console.log(error)
//                 return false;
//             }
//         } else {
//             console.log('Login first')
//             return false;
//         }
//     };

    

// return (
//     <LoginContext.Provider value={{ isLoggedIn, decodedToken, token }}>
//         {children}
//     </LoginContext.Provider>
// );
// };

import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [decodedToken, setDecodedToken] = useState(() => {
        return token ? jwtDecode(token) : "";
    });

    useEffect(() => {
        if (token) {
            setDecodedToken(jwtDecode(token));
        } else {
            setDecodedToken("");
        }
    }, [token]);

    const isLoggedIn = () => {
        // Check if a token exists
        if (token) {
            try {
                const currentTime = Date.now() / 1000; // Convert to seconds
                if (decodedToken.exp < currentTime) {
                    console.log('Token expired');
                    setToken(null); // Clear token if expired
                    return false;
                }
                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        } else {
            console.log('Login first');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setDecodedToken("");
    };

    return (
        <LoginContext.Provider value={{ isLoggedIn, decodedToken, token, setToken, logout }}>
            {children}
        </LoginContext.Provider>
    );
};
