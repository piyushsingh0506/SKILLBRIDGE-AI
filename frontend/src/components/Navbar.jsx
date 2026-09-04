import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { 
  Sparkles, Bell, User, LogOut, Menu, X, CheckCircle, 
  Briefcase, GraduationCap, Building, ShieldCheck, ChevronDown
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getNotifications()
        .then((res) => setNotifications(res.data))
        .catch((err) => console.error("Notifs error:", err));
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return { label: 'Student', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: GraduationCap };
      case 'industry':
        return { label: 'Industry Partner', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: Briefcase };
      case 'academician':
        return { label: 'Faculty Academician', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: GraduationCap };
      case 'institution':
        return { label: 'Institution Admin', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: Building };
      case 'admin':
        return { label: 'Super Admin', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: ShieldCheck };
      default:
        return { label: 'User', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: User };
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ayush-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-lg text-white tracking-tight">
                  Academia<span className="text-ayush-400">–Industry</span> Connect
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SIH 26044
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Ministry of Ayush • All India Institute of Ayurveda
              </p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Role Chip */}
              {user?.role && (
                <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role).color}`}>
                  {React.createElement(getRoleBadge(user.role).icon, { className: "w-3.5 h-3.5" })}
                  <span>{getRoleBadge(user.role).label}</span>
                </div>
              )}

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl p-4 border border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">Notifications</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-full text-slate-300">{unreadCount} new</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-ayush-400 hover:text-ayush-300 transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`py-2.5 px-2 rounded-lg transition ${n.is_read ? 'opacity-70' : 'bg-slate-800/40'}`}>
                            <div className="flex items-start justify-between">
                              <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800 transition border border-slate-800"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`}
                    alt={user?.full_name}
                    className="w-7 h-7 rounded-full bg-slate-800 ring-1 ring-emerald-500/40"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden md:block max-w-[120px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl p-2 border border-slate-700/80 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {user?.role === 'student' && (
                        <Link
                          to="/student/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        >
                          <User className="w-4 h-4 text-emerald-400" />
                          <span>My Profile</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-ayush-500 to-emerald-600 hover:from-ayush-400 hover:to-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
