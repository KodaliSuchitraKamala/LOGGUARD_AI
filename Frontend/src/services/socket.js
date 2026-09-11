// Socket disabled for Vercel deployment
// Using REST polling via Java Docker API instead

const socket = {
  on: () => {},
  off: () => {},
  emit: () => {},
  disconnect: () => {},
  connected: false,
  isDummy: true
};

console.log("ℹ️ Socket disabled - Using Java Docker API polling (Vercel doesn't support WebSockets)");

export const connectSocket = () => socket;
export default socket;