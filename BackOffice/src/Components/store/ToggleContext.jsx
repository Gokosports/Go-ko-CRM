import React, { createContext, useState } from "react";

export const ToggleContext = createContext();

export const ToggleProvider = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);;

    const onClickHandler = () => {
        setCollapsed(!collapsed)
    };
    return (
        <ToggleContext.Provider value={{ collapsed,onClickHandler }}>
            {children}
        </ToggleContext.Provider>
    );
};