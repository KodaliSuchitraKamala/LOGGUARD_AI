// src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api','') || "https://logguard-mern-api.vercel.app";

const isVercel = SOCKET_URL.includes("vercel.app");

export const socket = isVercel ? null : io(SOCKET_URL, {
  autoConnect: false,
});

if(isVercel){
  console.log("MERN on Vercel - socket disabled, using polling");
}