import { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext();

const dummySocket = {
  on: () => {},
  off: () => {},
  emit: () => {},
  disconnect: () => {},
  connected: false,
  isDummy: true
};

export const SocketProvider = ({ children }) => {
  const [socket] = useState(dummySocket);

  useEffect(() => {
    const isVercelMern = import.meta.env.VITE_API_URL_MERN?.includes('vercel.app');
    const isJavaActive = import.meta.env.VITE_API_URL_JAVA?.includes('railway.app');

    if (isJavaActive) {
      console.log("✅ HYBRID MODE: Java Docker API is ACTIVE for logs/analytics");
      console.log("ℹ️ Socket disabled - Vercel does not support WebSockets (using REST polling instead)");
    }

    if (isVercelMern) {
      console.log("ℹ️ MERN on Vercel detected - WebSocket 404 is expected, app will use API polling");
    }

    // Don't try to connect websocket on Vercel - it will always 404
    // Your Java API polling is enough for LogGuard AI
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);