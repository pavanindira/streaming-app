import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import Player from '../components/Player';
import FriendActivity from '../components/FriendActivity';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSongs } from '../api/musicAPI';
import { useUser } from '../hooks/useUser';

import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser();
  const { isPlaying, togglePlay, playNext, playPrevious, volume, setVolume } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) playNext();
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) playPrevious();
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setVolume(Math.min(1, volume + 0.1));
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setVolume(Math.max(0, volume - 0.1));
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, togglePlay, playNext, playPrevious, setVolume]);

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

      {user?.id && <FriendActivity />}

      {/* 🌟 Player uses Context now */}
      <Player />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
