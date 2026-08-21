import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) => 
    location.pathname === path 
      ? "text-blue-400 border-b-2 border-blue-400" 
      : "text-gray-300 hover:text-white";

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-lg border-b border-gray-700 sticky top-0 z-40">
      {/* Left - Logo */}
      <Link to="/" className="text-4xl font-bold tracking-wide shrink-0">
        LogGuard AI
      </Link>

      {/* Center - Dashboard, Analytics, Alerts, Admin Panel - EXACT MIDDLE */}
      <div className="flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        <Link to="/" className={`pb-1 text-sm font-medium ${isActive('/')}`}>
          Dashboard
        </Link>
        <Link to="/analytics" className={`pb-1 text-sm font-medium ${isActive('/analytics')}`}>
          Analytics
        </Link>
        <Link to="/alerts" className={`pb-1 text-sm font-medium ${isActive('/alerts')}`}>
          Alerts
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={`pb-1 text-sm font-medium ${isActive('/admin')}`}>
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right - Bell + Email + Logout */}
      <div className="flex items-center gap-4 shrink-0">
        <NotificationBell />
        <span className="text-sm text-gray-300">{user.email} ({user.role})</span>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm font-bold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}