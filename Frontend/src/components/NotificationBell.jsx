import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [show, setShow] = useState(false);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications');
      const list = Array.isArray(data)? data : (data.notifications || []);
      setNotifications(list);
      setUnread(list.filter(n=>!n.isRead &&!n.read).length);
    } catch(e) {
      setNotifications([]);
      setUnread(0);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Java polling
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try { await api.put('/notifications/read-all'); await api.put('/notifications/mark-all-read'); } catch(e) {}
    setUnread(0);
    fetchNotifs();
    setShow(false);
  }

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative p-2 hover:bg-white/10 rounded-full">
        <Bell className="w-6 h-6" />
        {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{unread}</span>}
      </button>
      {show && (
        <div className="absolute right-0 mt-3 w-80 bg-white text-black rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center bg-gray-50">
            <span className="font-bold">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
          </div>
          {notifications.length === 0? <p className="p-4 text-sm text-gray-500 text-center">No notifications</p> :
            notifications.slice(0,10).map((n, idx) => (
              <div key={n._id || n.id || idx} className={`p-3 border-b text-sm hover:bg-gray-50 ${!n.isRead &&!n.read? 'bg-blue-50' : ''}`}>
                <p className="font-medium text-xs">{n.message}</p>
                <p className="text-[11px] text-gray-500 mt-1">{n.createdAt? new Date(n.createdAt).toLocaleString('en-IN') : new Date(n.timestamp).toLocaleString('en-IN')}</p>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}