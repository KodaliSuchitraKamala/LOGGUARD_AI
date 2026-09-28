const mockSocket = {
  on: () => {},
  off: () => {},
  emit: () => {},
  connect: () => {},
  disconnect: () => {},
  connected: false
};
export const socket = mockSocket;
export default mockSocket;
console.log("Socket disabled for Vercel serverless");
