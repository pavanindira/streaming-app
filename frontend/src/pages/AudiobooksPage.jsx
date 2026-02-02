import { useQuery } from '@tanstack/react-query';
import { fetchAudiobooks } from '../api/musicAPI';
import { usePlayer } from '../context/PlayerContext';
import { FaPlay, FaBookOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AudiobooksPage = () => {
    const { playSong } = usePlayer();

    const { data: audiobooks, isLoading, error } = useQuery({
        queryKey: ['audiobooks'],
        queryFn: () => fetchAudiobooks(),
    });

    if (isLoading) return <p className="text-gray-400 p-8">Loading audiobooks...</p>;
    if (error) return <p className="text-red-400 p-8">Error loading audiobooks.</p>;

    return (
        <div className="pb-24">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                <div className="w-52 h-52 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg shadow-2xl flex items-center justify-center shrink-0">
                    <FaBookOpen className="text-6xl text-white drop-shadow-lg" />
                </div>
                <div className="flex-1 space-y-4">
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Library</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">Audiobooks</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="font-bold text-white">Groove</span>
                        <span>• {audiobooks?.length || 0} titles</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {audiobooks?.map((book, i) => (
                    <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => playSong({ ...book, type: 'audiobook' })} // Pass type for player logic
                    >
                        <div className="relative aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={book.cover_image_url || 'https://placehold.co/300x300?text=Audiobook'}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:bg-green-400">
                                    <FaPlay className="text-black ml-1" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-white font-bold truncate mb-1">{book.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{book.author}</p>
                        {book.narrator && <p className="text-gray-500 text-xs truncate mt-1">Nar: {book.narrator}</p>}
                    </motion.div>
                ))}
            </div>

            {audiobooks?.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p>No audiobooks found in the library.</p>
                </div>
            )}
        </div>
    );
};

export default AudiobooksPage;
