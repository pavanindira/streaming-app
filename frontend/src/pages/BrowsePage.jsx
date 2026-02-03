import { useQuery } from '@tanstack/react-query';
import { fetchGenres } from '../api/musicAPI';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BrowsePage = () => {
    const { data: genres, isLoading, error } = useQuery({
        queryKey: ['genres'],
        queryFn: fetchGenres,
    });

    if (isLoading) return <div className="p-8 text-center text-gray-400">Loading genres...</div>;
    if (error) return <div className="p-8 text-center text-red-400">Error loading genres.</div>;

    // Fallback if no genres found or empty array
    const genreList = genres && genres.length > 0 ? genres : ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'Classical', 'Electronic'];

    // Specific colors for some genres (mocking a "distinct look")
    const getGenreColor = (genre) => {
        const colors = {
            'Pop': 'from-pink-500 to-rose-500',
            'Rock': 'from-red-600 to-orange-600',
            'Hip Hop': 'from-orange-500 to-amber-500',
            'Jazz': 'from-blue-600 to-cyan-500',
            'Classical': 'from-amber-600 to-yellow-600',
            'Electronic': 'from-purple-600 to-indigo-600',
            'Metal': 'from-gray-700 to-black',
            'R&B': 'from-indigo-500 to-blue-500',
        };
        return colors[genre] || 'from-emerald-500 to-teal-500'; // Default
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-white mb-8">Browse Genres</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {genreList.map((genre, index) => (
                    <Link to={`/browse/${encodeURIComponent(genre)}`} key={index}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                h-40 rounded-xl p-6 relative overflow-hidden cursor-pointer
                                bg-gradient-to-br ${getGenreColor(genre)}
                                shadow-lg hover:shadow-xl transition-shadow
                            `}
                        >
                            <h3 className="text-2xl font-bold text-white relative z-10">{genre}</h3>
                            {/* Decorative Circle */}
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl transform rotate-12" />
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BrowsePage;
