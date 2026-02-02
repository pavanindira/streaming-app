import { useUser } from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // 🔄 Now navigation is handled here
  };

  return (
    <header className="glass p-4 flex justify-between items-center sticky top-0 z-40 bg-opacity-50">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-white text-xl p-2 hover:bg-white/10 rounded-lg"
        >
          <FaBars />
        </button>
        <h1 className="text-white text-2xl font-bold tracking-tight">Music Stream</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-300 text-sm">Welcome, <span className="text-white font-medium">{user.username}</span></span>
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/50 hover:border-blue-500 font-bold py-1 px-4 rounded-full transition-all text-sm"
              >
                Admin Panel
              </button>
            )}
            {user.role === 'artist' && (
              <button
                onClick={() => navigate('/artist/dashboard')}
                className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 border border-purple-500/50 hover:border-purple-500 font-bold py-1 px-4 rounded-full transition-all text-sm"
              >
                Artist Studio
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50 hover:border-red-500 font-bold py-1 px-4 rounded-full transition-all text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white font-medium px-3 py-1">Login</button>
            <button onClick={() => navigate('/register')} className="bg-white text-black px-4 py-1 rounded-full font-medium hover:bg-gray-200">Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
