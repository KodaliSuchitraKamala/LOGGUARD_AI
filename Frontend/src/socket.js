import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("new_log", (data) => console.log("New logs:", data))
socket.on("new_alert", (alert) => console.log("New Alert:", alert))

export default socket;