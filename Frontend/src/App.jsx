import { useState } from "react";
import Login from "./components/Login";
import LogList from "./components/LogList";

export default function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
  };

  if (!isAuth) return <Login onLogin={() => setIsAuth(true)} />;

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">LogGuard AI Dashboard</h1>
        <button onClick={logout} className="border px-3 py-1">Logout</button>
      </div>
      <LogList />
    </div>
  );
}