import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import Player from '../components/Player';
import FriendActivity from '../components/FriendActivity';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../api/musicAPI';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // We needs useLocation to trigger animation on route change
  // hook not imported yet, adding import

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar
          tracks={[]}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 pb-24 relative">
          <Outlet />
        </main>
      </div>

      <FriendActivity />

      {/* 🌟 Player uses Context now */}
      {/* 🌟 Player uses Context now */}
      <Player />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
