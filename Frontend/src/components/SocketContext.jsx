import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState({
    on: () => {},
    off: () => {},
    emit: () => {},
    disconnect: () => {},
    connected: false
  });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    const isMern = API_URL.includes("5000");

    if (!isMern) {
      console.log("Java backend active - socket disabled");
      return; // keep dummy
    }

    console.log("MERN backend active - connecting socket to 5000");
    const s = io("http://localhost:5000");
    setSocket(s);
    
    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);