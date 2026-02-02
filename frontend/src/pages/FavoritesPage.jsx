import { useQuery } from '@tanstack/react-query';
import { fetchFavorites } from '../api/musicAPI';
import { usePlayer } from '../context/PlayerContext';
import { FaPlay, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FavoritesPage = () => {
    const { playSong } = usePlayer();

    const { data: songs, isLoading, error } = useQuery({
        queryKey: ['favorites'],
        queryFn: fetchFavorites,
    });

    if (isLoading) return <p className="text-gray-400 p-8">Loading favorites...</p>;
    if (error) return <p className="text-red-400 p-8">Error loading favorites.</p>;

    return (
        <div className="pb-24">
            <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                <div className="w-52 h-52 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-2xl flex items-center justify-center shrink-0">
                    <FaHeart className="text-6xl text-white drop-shadow-lg" />
                </div>
                <div className="flex-1 space-y-4">
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Playlist</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">Liked Songs</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="flex -space-x-2 mr-2">
                            {/* Placeholder for user avatars if shared, just show user info */}
                        </div>
                        <span className="font-bold text-white">You</span>
                        <span>• {songs?.length || 0} songs</span>
                    </div>
                </div>
            </div>

            {/* Song List */}
            <div className="space-y-1">
                {/* Header Row */}
                <div className="grid grid-cols-[16px_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 mb-2 font-medium tracking-wide">
                    <span>#</span>
                    <span>Title</span>
                    <span>Artist</span>
                    <span>Date Added</span>
                </div>

                {songs?.map((song, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        key={song.id}
                        className="grid grid-cols-[16px_1fr_1fr_auto] gap-4 px-4 py-3 rounded-md hover:bg-white/10 group items-center transition-colors cursor-pointer"
                        onClick={() => playSong(song, songs)}
                    >
                        <span className="text-gray-500 text-sm group-hover:hidden font-mono">{i + 1}</span>
                        <FaPlay className="text-purple-400 text-xs hidden group-hover:block" />

                        <div className="flex items-center gap-4 overflow-hidden">
                            {song.cover_image_url && <img src={song.cover_image_url} className="w-10 h-10 rounded shadow-md object-cover" />}
                            <div className="flex flex-col">
                                <span className="text-white font-medium truncate text-[15px]">{song.title}</span>
                            </div>
                        </div>

                        <span className="text-gray-400 text-sm truncate hover:text-white transition-colors hover:underline cursor-pointer">{song.artist?.name || 'Unknown'}</span>

                        {/* Date Added (Mock for now or use createdAt from junction if available, but we just fetched songs) */}
                        <span className="text-gray-500 text-sm">Now</span>
                    </motion.div>
                ))}

                {songs?.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-white mb-2">Songs you like will appear here</h3>
                        <p className="text-gray-400">Save songs by tapping the heart icon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
