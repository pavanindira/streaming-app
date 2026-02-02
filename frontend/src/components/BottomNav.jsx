import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaBook, FaHeart } from 'react-icons/fa';

const BottomNav = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 p-2 z-50 md:hidden flex justify-around items-center pb-safe">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                    }`
                }
            >
                <FaHome size={20} />
                <span className="text-[10px]">Home</span>
            </NavLink>

            <NavLink
                to="/search"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                    }`
                }
            >
                <FaSearch size={20} />
                <span className="text-[10px]">Search</span>
            </NavLink>

            <NavLink
                to="/library"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                    }`
                }
            >
                <FaBook size={20} />
                <span className="text-[10px]">Library</span>
            </NavLink>

            <NavLink
                to="/favorites"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                    }`
                }
            >
                <FaHeart size={20} />
                <span className="text-[10px]">Favorites</span>
            </NavLink>
        </div>
    );
};

export default BottomNav;
