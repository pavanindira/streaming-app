import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FaPlay, FaHeart, FaEllipsisH, FaPlus, FaRandom } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported
import { useQuery } from '@tanstack/react-query';
import { fetchSongs, fetchAlbums } from '../api/musicAPI';
import Skeleton from '../components/Skeleton';
import { usePlayer } from '../context/PlayerContext';

const HomePage = () => {
  const { onSelect } = useOutletContext() || {};
  const { playSong } = usePlayer();
  const [songToAdd, setSongToAdd] = useState(null);
  const navigate = useNavigate();

  // Dynamic Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const { data: songs, isLoading, error } = useQuery({
    queryKey: ['songs'],
    queryFn: () => fetchSongs(),
  });



  const { data: madeForYou } = useQuery({
    queryKey: ['songs', 'random'],
    queryFn: () => fetchSongs({ sort: 'random', limit: 5 }),
    staleTime: 1000 * 60 * 5, // Cache for 5 mins so it doesn't reshuffle on every click
  });

  // Fetch Featured Songs
  const { data: featuredSongsData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['songs', 'featured'],
    queryFn: () => fetchSongs({ featured: 'true' }),
  });

  // Fetch Featured Albums
  const { data: featuredAlbumsData } = useQuery({
    queryKey: ['albums', 'featured'],
    queryFn: () => fetchAlbums({ featured: 'true' }),
  });

  if (isLoading) return (
    <div className="space-y-10 pb-24 p-6">
      <Skeleton className="h-96 w-full rounded-3xl" variant="rectangular" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-2xl" variant="rectangular" />
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return <div className="text-red-400 text-center p-20 glass rounded-3xl flex items-center justify-center h-96">Error loading songs. Please check backend connection.</div>;

  // Use the first featured song for Hero, or fallback to first song
  const featuredSong = (featuredSongsData && featuredSongsData.length > 0) ? featuredSongsData[0] : (songs && songs.length > 0 ? songs[0] : {
    title: "No Songs Available",
    artist: { name: "System" },
    file_url: "",
    cover_image_url: "https://placehold.co/500"
  });

  // Use the rest as trending
  const trending = songs && songs.length > 0 ? songs.slice(0, 12) : [];

  // Handle Surprise Me
  const handleSurpriseMe = async () => {
    try {
      const randomSongs = await fetchSongs({ sort: 'random', limit: 1 });
      if (randomSongs && randomSongs.length > 0) {
        playSong(randomSongs[0]);
      }
    } catch (err) {
      console.error("Failed to fetch random song", err);
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-[500px] rounded-[30px] overflow-hidden group shadow-2xl glass mx-6"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
        {/* Dynamic Greeting Overlay */}
        <div className="absolute top-8 left-10 z-20">
          <h2 className="text-2xl font-medium text-white/80 tracking-wide">{greeting}</h2>
        </div>

        <img src={featuredSong.cover_image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"} alt="Featured" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />

        <div className="absolute bottom-0 left-0 p-10 z-20 w-full md:w-2/3">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-sm">Featured Track</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-lg">{featuredSong.title}</h1>
          <p className="text-xl text-gray-200 mb-8 font-light drop-shadow-md">By <span className="text-white font-medium">{featuredSong.artist?.name || "Unknown Artist"}</span></p>
          <div className="flex gap-4">
            <button
              onClick={() => playSong(featuredSong)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-full flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.5)]"
            >
              <FaPlay className="text-lg" /> Play Now
            </button>
            <button
              onClick={handleSurpriseMe}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 transition-all hover:scale-105 border border-white/20 backdrop-blur-md"
            >
              <FaRandom className="text-lg" /> Surprise Me
            </button>
          </div>
        </div>
      </motion.div>

      {/* Made For You Section */}
      {madeForYou && madeForYou.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Made For You</h2>
            <p className="text-sm text-gray-400">Based on your taste</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {madeForYou.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-4 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-2 relative"
                onClick={() => playSong(track, madeForYou)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
                  <img src={track.cover_image_url} alt={track.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); playSong(track, madeForYou); }}
                      className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:scale-110"
                    >
                      <FaPlay className="pl-1" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSongToAdd(track); }}
                      className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 hover:scale-110"
                      title="Add to Playlist"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-semibold truncate text-md">{track.title}</h3>
                <p className="text-gray-400 text-xs truncate mt-1">{track.artist?.name}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Albums Section */}
      {featuredAlbumsData && featuredAlbumsData.data && featuredAlbumsData.data.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white">Featured Albums</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {featuredAlbumsData.data.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-4 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer relative"
                onClick={() => navigate(`/albums/${album.id}`)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
                  <img src={album.cover_image_url || "https://placehold.co/300"} alt={album.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    {/* Play button for album could play all songs, but for now just show cover */}
                  </div>
                </div>
                <h3 className="text-white font-semibold truncate text-md">{album.title}</h3>
                <p className="text-gray-400 text-xs truncate mt-1">{album.artist?.name}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trending.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="glass p-4 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-2"
              onClick={() => playSong(track, trending)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
                <img src={track.cover_image_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"} alt={track.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); playSong(track, trending); }}
                    className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:scale-110"
                  >
                    <FaPlay className="pl-1" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSongToAdd(track); }}
                    className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 hover:scale-110"
                    title="Add to Playlist"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold truncate text-md">{track.title}</h3>
              <p className="text-gray-400 text-xs truncate mt-1">{track.artist?.name || "Unknown"}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {songToAdd && (
          <AddToPlaylistModal
            song={songToAdd}
            onClose={() => setSongToAdd(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
