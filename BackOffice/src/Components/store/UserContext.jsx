import React, { createContext, useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          userId: decodedToken.userId,
          name: decodedToken.name,
          role: decodedToken.role,
          commercialId: decodedToken.commercialId,
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};
