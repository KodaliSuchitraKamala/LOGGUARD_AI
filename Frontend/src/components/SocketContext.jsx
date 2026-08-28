import { createContext, useContext } from "react";
const SocketContext = createContext({ on: () => {}, off: () => {}, emit: () => {} });

export const SocketProvider = ({ children }) => {
  console.log("Java backend active - socket disabled (polling mode)");
  return (
    <SocketContext.Provider value={{ on: () => {}, off: () => {}, emit: () => {}, connected: false }}>
      {children}
    </SocketContext.Provider>
  );
};
export const useSocket = () => useContext(SocketContext);