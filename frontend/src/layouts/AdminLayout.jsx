import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaMusic, FaCompactDisc, FaUsers, FaMicrophone, FaTags, FaTachometerAlt, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useUser();
  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive(to)
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 translate-x-1'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon size={18} className={isActive(to) ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
      {label}
    </Link>
  );

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-white overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-20 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 w-72 bg-[#121218] flex flex-col border-r border-white/5 shadow-2xl z-30
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm">
              M
            </span>
            MusicAdmin
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview</p>
          <NavItem to="/admin" icon={FaTachometerAlt} label="Dashboard" />

          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Content</p>
          <NavItem to="/admin/songs" icon={FaMusic} label="Songs" />
          <NavItem to="/admin/albums" icon={FaCompactDisc} label="Albums" />
          <NavItem to="/admin/artists" icon={FaMicrophone} label="Artists" />
          <NavItem to="/admin/labels" icon={FaTags} label="Labels" />

          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Management</p>
          <NavItem to="/admin/users" icon={FaUsers} label="Users" />
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@music.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
        </div>

        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 z-10 bg-[#0a0a0f]/80 backdrop-blur-md md:hidden shrink-0">
          <h2 className="text-lg font-bold text-white">MusicAdmin</h2>
          <button
            className="p-2 text-gray-400 hover:text-white active:bg-white/10 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 z-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
