import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCheck, 
  Settings, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Award, 
  Info, 
  Check, 
  ChevronRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { notificationsApi, requestsApi } from '../services/api';
import RatingModal from '../components/RatingModal';

export default function Notifications({ onUpdateUnread }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const [loading, setLoading] = useState(true);
  const [ratingModalTicket, setRatingModalTicket] = useState(null);

  const fetchNotifs = () => {
    setLoading(true);
    notificationsApi.getAll()
      .then((res) => {
        setNotifications(res.data.notifications);
        if (onUpdateUnread) onUpdateUnread(res.data.unreadCount);
      })
      .catch((err) => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      if (onUpdateUnread) onUpdateUnread(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (onUpdateUnread) onUpdateUnread(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionClick = (notif, action) => {
    if (action.type === 'mark-read') {
      handleMarkRead(notif.id);
      return;
    }

    if (action.type === 'track') {
      alert(`Technician David Chen is currently en route to Science Bldg U2017 (ETA: 8 mins).`);
      return;
    }

    if (action.type === 'view-ticket' && notif.ticketId) {
      navigate(`/requests/${notif.ticketId}`);
      return;
    }

    if (action.type === 'rate') {
      setRatingModalTicket({ id: notif.ticketId || 'REQ-8270', title: 'Server Room Fan Noise' });
      return;
    }

    if (action.type === 'advisory') {
      alert('Engineering Block B Scheduled Power Interruption: From 14:00 to 16:00 on Friday. Backup generators will supply essential laboratory loads only.');
      return;
    }
  };

  const filteredNotifs = activeTab === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const getIcon = (type) => {
    switch (type) {
      case 'dispatch':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        );
      case 'approved':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'parts':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        );
      case 'completed':
        return (
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241919]">Notification Center</h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Manage and view all your system alerts and updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#e2e8f0] bg-white text-[#574141] hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <CheckCheck className="w-4 h-4 text-[#574141]" />
            <span>Mark all as read</span>
          </button>
          <button
            onClick={() => navigate('/settings/notifications')}
            className="p-2.5 bg-[#7a1521] text-white hover:bg-[#58000f] rounded-lg shadow-sm transition-colors"
            title="Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e2e8f0] flex items-center gap-8 text-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'all'
              ? 'text-[#7a1521]'
              : 'text-[#574141] hover:text-[#241919]'
          }`}
        >
          All Notifications
          {activeTab === 'all' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7a1521]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('unread')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'unread'
              ? 'text-[#7a1521]'
              : 'text-[#574141] hover:text-[#241919]'
          }`}
        >
          Unread
          {activeTab === 'unread' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7a1521]"></span>
          )}
        </button>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-card divide-y divide-[#f1f5f9] overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-[#574141]">
            <p className="text-sm font-semibold">No notifications found.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start gap-4 hover:bg-[#fff8f7] transition-colors ${
                !notif.read ? 'bg-white' : 'bg-[#fafafa]/50 opacity-85'
              }`}
            >
              {getIcon(notif.type)}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-[#241919]">{notif.title}</h3>
                  {notif.badge && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        notif.badgeType === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : notif.badgeType === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notif.badgeType === 'info'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {notif.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#574141] leading-relaxed mb-3">
                  {notif.description}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  {notif.actions?.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(notif, act)}
                      className={`flex items-center gap-1 transition-colors ${
                        act.type === 'mark-read'
                          ? 'text-[#8a7170] hover:text-[#241919]'
                          : 'text-[#7a1521] hover:underline'
                      }`}
                    >
                      {act.type === 'mark-read' && <Check className="w-3.5 h-3.5" />}
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Bottom Load Older */}
        <div className="p-4 bg-[#f8fafc] text-center border-t border-[#e2e8f0]">
          <button
            onClick={() => alert('All recent notifications are loaded.')}
            className="text-xs font-semibold text-[#574141] hover:text-[#7a1521] transition-colors"
          >
            Load older notifications
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={Boolean(ratingModalTicket)}
        ticket={ratingModalTicket}
        onClose={() => setRatingModalTicket(null)}
        onSubmit={async (ticketId, rating, feedback) => {
          await requestsApi.rate(ticketId, { rating, feedback });
          fetchNotifs();
        }}
      />
    </div>
  );
}
