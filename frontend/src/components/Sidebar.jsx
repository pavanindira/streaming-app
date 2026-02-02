import { FaHome, FaSearch, FaMusic, FaHeart, FaTimes, FaBookOpen, FaUserFriends } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { usePlayer } from '../context/PlayerContext';

const Sidebar = ({ tracks = [], isOpen, onClose }) => {
  const { playSong } = usePlayer();
  const { user } = useUser();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        glass h-full flex flex-col p-6 z-50
        fixed md:relative inset-y-0 left-0 w-64 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Groove
            </h1>
            {user?.role === 'artist' && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">ARTIST</span>}
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pb-24">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu</p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" onClick={onClose}>
                  <FaHome /> Home
                </Link>
              </li>
              <li>
                <Link to="/following" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" onClick={onClose}>
                  <FaUserFriends /> Following
                </Link>
              </li>
              {user?.role === 'artist' && (
                <li>
                  <Link to="/artist/dashboard" className="flex items-center gap-3 text-purple-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-purple-500/20 border border-transparent hover:border-purple-500/50" onClick={onClose}>
                    <FaMusic /> Artist Studio
                  </Link>
                </li>
              )}
              <li>
                <Link to="/search" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" onClick={onClose}>
                  <FaSearch /> Search
                </Link>
              </li>
              <li>
                <Link to="/library" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" onClick={onClose}>
                  <FaMusic /> Your Library
                </Link>
              </li>
              <li>
                <Link to="/audiobooks" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5" onClick={onClose}>
                  <FaBookOpen /> Audiobooks
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 group" onClick={onClose}>
                  <div className="p-1 bg-gradient-to-br from-purple-700 to-blue-700 rounded-sm group-hover:opacity-80 transition-opacity">
                    <FaHeart className="text-xs text-white" />
                  </div>
                  Liked Songs
                </Link>
              </li>
            </ul>
          </div>

          {user && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Tracks</p>
              <ul className="space-y-1">
                {tracks.map((track, index) => (
                  <li key={index}>
                    <button
                      className="w-full text-left flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 truncate"
                      onClick={() => {
                        playSong(track, tracks);
                        onClose && onClose();
                      }}
                    >
                      <FaMusic className="text-xs opacity-70" />
                      <span className="truncate">{track.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
