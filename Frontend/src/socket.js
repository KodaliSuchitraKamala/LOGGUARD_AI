import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const isMern = API_URL.includes("5000");

let socket;

if (isMern) {
  // MERN - real socket
  socket = io("http://localhost:5000");
  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("new_log", (data) => console.log("New logs:", data));
  socket.on("new_alert", (alert) => console.log("New Alert:", alert));
} else {
  // Java - dummy socket (prevents 5000 error)
  console.log("Java backend active - socket disabled (socket.js)");
  socket = {
    on: () => {},
    off: () => {},
    emit: () => {},
    disconnect: () => {},
    connected: false,
    id: "java"
  };
}

export default socket;