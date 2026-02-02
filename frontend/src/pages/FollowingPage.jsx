import { useQuery } from '@tanstack/react-query';
import { fetchUserFeed } from '../api/musicAPI';
import { usePlayer } from '../context/PlayerContext';
import { FaPlay, FaUserFriends, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FollowingPage = () => {
    const { playSong } = usePlayer();

    const { data: songs, isLoading, error } = useQuery({
        queryKey: ['feed'],
        queryFn: fetchUserFeed,
    });

    if (isLoading) return <div className="text-gray-400 p-8">Loading your feed...</div>;
    if (error) return <div className="text-red-400 p-8">Error loading feed.</div>;

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                <div className="w-52 h-52 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-2xl flex items-center justify-center shrink-0">
                    <FaUserFriends className="text-6xl text-white drop-shadow-lg" />
                </div>
                <div className="flex-1 space-y-4">
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Your Feed</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">New Releases</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="font-bold text-white">Latest Tracks</span>
                        <span>• {songs?.length || 0} songs from artists you follow</span>
                    </div>
                </div>
            </div>

            {/* Song Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {songs?.map((song, i) => (
                    <motion.div
                        key={song.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-4 cursor-pointer"
                        onClick={() => playSong(song)}
                    >
                        <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                            <img
                                src={song.cover_image_url || 'https://placehold.co/100'}
                                alt={song.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <FaPlay className="text-white text-sm" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-white font-bold truncate">{song.title}</h3>
                            <p className="text-gray-400 text-sm truncate">{song.artist?.name}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <FaCalendarAlt />
                                <span>{new Date(song.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {songs?.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl font-medium mb-2">No updates yet</p>
                    <p>Follow more artists to see their new releases here!</p>
                </div>
            )}
        </div>
    );
};

export default FollowingPage;
