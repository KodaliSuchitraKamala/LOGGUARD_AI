import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) =>
    location.pathname === path
     ? "text-blue-400 border-b-2 border-blue-400"
      : "text-gray-300 hover:text-white";

  const role = user.role || "user";
  const displayName = user.name?.trim() || user.email?.split('@')[0] || "User";

  return (
    <nav className="bg-gray-900 text-white px-4 md:px-6 py-3 flex items-center justify-between shadow-lg border-b border-gray-700 sticky top-0 z-50">
      <Link to="/" className="text-xl md:text-3xl font-bold tracking-wide shrink-0">
        LogGuard AI
      </Link>

      {/* Desktop tagline */}
      <div className="hidden xl:flex flex-col ml-6 border-l border-gray-700 pl-6 shrink-0">
        <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Upload 10k Logs → Root Cause in 2 Sec • 94% Accuracy</span>
      </div>

      {/* Desktop center links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8 mx-auto">
        <Link to="/" className={`pb-1 text-sm font-medium ${isActive('/')}`} onClick={()=>setMenuOpen(false)}>Dashboard</Link>
        <Link to="/analytics" className={`pb-1 text-sm font-medium ${isActive('/analytics')}`} onClick={()=>setMenuOpen(false)}>Analytics</Link>
        <Link to="/alerts" className={`pb-1 text-sm font-medium ${isActive('/alerts')}`} onClick={()=>setMenuOpen(false)}>Alerts</Link>
        {role === 'admin' && <Link to="/admin" className={`pb-1 text-sm font-medium ${isActive('/admin')}`} onClick={()=>setMenuOpen(false)}>Admin Panel</Link>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <NotificationBell />
        <div className="hidden md:flex flex-col items-end leading-none">
          <span className="text-sm font-semibold">{displayName}</span>
          <span className="text-[10px] text-gray-400">{user.email}</span>
        </div>
        <span className={`hidden md:inline px-2 py-0.5 rounded-full text-xs font-bold uppercase ${role === 'admin'? 'bg-purple-600' : 'bg-green-600'}`}>{role}</span>
        <button onClick={handleLogout} className="hidden md:block bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm font-bold">Logout</button>

        {/* Mobile hamburger */}
        <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-900 border-t border-gray-700 flex flex-col p-4 gap-4 md:hidden">
          <Link to="/" className={`${isActive('/')} py-2`} onClick={()=>setMenuOpen(false)}>Dashboard</Link>
          <Link to="/analytics" className={`${isActive('/analytics')} py-2`} onClick={()=>setMenuOpen(false)}>Analytics</Link>
          <Link to="/alerts" className={`${isActive('/alerts')} py-2`} onClick={()=>setMenuOpen(false)}>Alerts</Link>
          {role === 'admin' && <Link to="/admin" className={`${isActive('/admin')} py-2`} onClick={()=>setMenuOpen(false)}>Admin Panel</Link>}
          <div className="border-t border-gray-700 pt-4 flex flex-col gap-2">
            <span className="text-sm">{displayName}</span>
            <span className="text-xs text-gray-400">{user.email}</span>
            <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-bold uppercase ${role === 'admin'? 'bg-purple-600' : 'bg-green-600'}`}>{role}</span>
            <button onClick={handleLogout} className="bg-red-600 px-3 py-2 rounded hover:bg-red-700 text-sm font-bold mt-2">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}