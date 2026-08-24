import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import socket from '../socket';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [show, setShow] = useState(false);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications');
      // Handle both formats: [] or {notifications, unreadCount}
      if(Array.isArray(data)){
        setNotifications(data);
        setUnread(0);
      } else {
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      }
    } catch(e) {
      setNotifications([]);
      setUnread(0);
    }
  };

  useEffect(() => {
    fetchNotifs();
    socket.on('newNotification', fetchNotifs);
    socket.on('notificationRead', fetchNotifs);
    socket.on('new_log', fetchNotifs);
    return () => {
      socket.off('newNotification', fetchNotifs);
      socket.off('notificationRead', fetchNotifs);
      socket.off('new_log', fetchNotifs);
    }
  }, []);

  const markAllRead = async () => {
    try { await api.put('/notifications/read-all'); } catch(e) {}
    fetchNotifs();
  }

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative p-1">
        <Bell className="w-6 h-6 hover:text-blue-400" />
        {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{unread}</span>}
      </button>
      {show && (
        <div className="absolute right-0 mt-3 w-80 bg-white text-black rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center bg-gray-50">
            <Link to="/notifications" onClick={()=>setShow(false)} className="font-bold hover:text-blue-600">Notifications - View All</Link>
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
          </div>
          {notifications.length === 0? <p className="p-4 text-sm text-gray-500 text-center">No notifications</p> :
            notifications.slice(0,5).map((n) => (
              <div key={n._id || Math.random()} className={`p-3 border-b text-sm ${!n.isRead? 'bg-blue-50' : ''}`}>
                <p className="font-medium truncate">{n.message}</p>
                <p className="text-xs text-gray-500">{n.createdAt? new Date(n.createdAt).toLocaleString('en-IN') : ''}</p>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}