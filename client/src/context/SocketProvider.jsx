import React, { createContext, useMemo, useContext, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};

export const SocketProvider = (props) => {
    const socket = useMemo(() => io("http://localhost:8000"), []);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket connected");
            // Add your logic here for the "connect" event
        });

        // Add more event listeners here if needed

        return () => {
            // Clean up event listeners when the component unmounts
            socket.off("connect");
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
};