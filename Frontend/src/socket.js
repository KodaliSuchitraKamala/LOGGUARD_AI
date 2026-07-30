import { io } from "socket.io-client";
const s = io("http://localhost:5000");
s.on("newLog", (data) => console.log("Got log:", data))