import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    localStorage.clear(); // clear old data without role
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) =>
    location.pathname === path
     ? "text-blue-400 border-b-2 border-blue-400"
      : "text-gray-300 hover:text-white";

  // Fallback if role is missing
  const role = user.role || "admin";
  const displayName = user.name || user.email?.split('@')[0] || "User";

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-lg border-b border-gray-700 sticky top-0 z-40">
      {/* Left - Logo */}
      <Link to="/" className="text-4xl font-bold tracking-wide shrink-0">
        LogGuard AI
      </Link>

      {/* Center */}
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
        {role === 'admin' && (
          <Link to="/admin" className={`pb-1 text-sm font-medium ${isActive('/admin')}`}>
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right - Bell + Email + Role Badge + Logout */}
      <div className="flex items-center gap-4 shrink-0">
        <NotificationBell />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-300 hidden md:inline">{user.email}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
            role === 'admin'? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {role}
          </span>
        </div>
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