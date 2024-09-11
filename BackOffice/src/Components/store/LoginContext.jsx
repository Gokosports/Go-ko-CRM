import React, { createContext, useState } from "react";
import { jwtDecode } from 'jwt-decode';
export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const token = localStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : "";
    const isLoggedIn = () => {
        const token = localStorage.getItem('token');
        // Check if a token exists
        if (token) {
            try {
                //decode the token
                const currentTime = Date.now() / 1000; // Convert to seconds
                if (decodedToken.exp < currentTime) {
                    console.log('Token expired')
                    return false;
                }
                return true;
            } catch (error) {
                console.log(error)
                return false;
            }
        } else {
            console.log('Login first')
            return false;
        }
    };

    

return (
    <LoginContext.Provider value={{ isLoggedIn, decodedToken, token }}>
        {children}
    </LoginContext.Provider>
);
};