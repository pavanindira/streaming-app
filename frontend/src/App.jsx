import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import UserProvider from './context/UserContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PlaylistsPage from './pages/PlaylistsPage';
import FavoritesPage from './pages/FavoritesPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import AudiobooksPage from './pages/AudiobooksPage';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistDetailPage from './pages/ArtistDetailPage';
import FollowingPage from './pages/FollowingPage';
import UserProfile from './pages/UserProfile';
import AlbumDetailPage from './pages/AlbumDetailPage';

import Login from './pages/Login';
import Register from './pages/Register';
import NotAuthorized from './pages/NotAuthorized';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSongs from './pages/admin/ManageSongs';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAlbums from './pages/admin/ManageAlbums';
import ManageArtists from './pages/admin/ManageArtists';
import ManageLabels from './pages/admin/ManageLabels';
import ProtectedRoute from './components/ProtectedRoute';
import { PlayerProvider } from './context/PlayerContext';

// AnimatedRoutes component to handle useLocation
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="library" element={<PageTransition><PlaylistsPage /></PageTransition>} />
          <Route path="favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />
          <Route path="following" element={<PageTransition><FollowingPage /></PageTransition>} />
          <Route path="playlists/:id" element={<PageTransition><PlaylistDetailPage /></PageTransition>} />
          <Route path="audiobooks" element={<PageTransition><AudiobooksPage /></PageTransition>} />
          <Route path="albums/:id" element={<PageTransition><AlbumDetailPage /></PageTransition>} />
          <Route path="artists/:id" element={<PageTransition><ArtistDetailPage /></PageTransition>} />
          <Route path="artist/dashboard" element={
            <ProtectedRoute allowedRoles={['artist', 'admin']}>
              <PageTransition><ArtistDashboard /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="user/:id" element={<PageTransition><UserProfile /></PageTransition>} />
          <Route path="register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="not-authorized" element={<NotAuthorized />} />
        </Route>

        {/* 🌟 Admin Section Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/songs" element={<ManageSongs />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/albums" element={<ManageAlbums />} />
          <Route path="/admin/artists" element={<ManageArtists />} />
          <Route path="/admin/labels" element={<ManageLabels />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <UserProvider>
      <PlayerProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }} />
      </PlayerProvider>
    </UserProvider>
  );
};

export default App;
