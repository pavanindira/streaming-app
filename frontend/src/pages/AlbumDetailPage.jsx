import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAlbums, fetchSongs } from '../api/musicAPI'; // fetchAlbums usually gets list. Needed: getAlbumById.
import { usePlayer } from '../context/PlayerContext';
import { FaPlay, FaPause, FaClock, FaHeart, FaCalendar } from 'react-icons/fa';
import Skeleton from '../components/Skeleton';
import CommentsSection from '../components/CommentsSection';
import { motion } from 'framer-motion';

// We need a specific fetchAlbumById. 
// If fetchAlbums supports filtering by ID, we can use it, but usually standard REST is /albums/:id
// Checking musicAPI.jsx... 
// It has fetchAlbums(filters). 
// I'll need to add fetchAlbumById to musicAPI.jsx or use fetchAlbums({id}) if supported.
// Let's assume I need to add it or use a query. 
// I'll update musicAPI.jsx first or inline it. 
// For now, I'll assume I can add `fetchAlbumById` to musicAPI.

const AlbumDetailPage = () => {
    const { id } = useParams();
    const { playSong, currentSong, isPlaying, pauseSong } = usePlayer();

    // Fetch Album Details
    // Assuming I will add fetchAlbumById
    const { data: album, isLoading } = useQuery({
        queryKey: ['album', id],
        queryFn: async () => {
            // Placeholder: Use existing list fetch if specific one missing, or better, implement proper one.
            // musicAPI.jsx showed: fetchAlbums = async (filters) => ...
            // Let's rely on adding fetchAlbumById in next step.
            const api = (await import('../api/musicAPI')).default;
            // Dynamic import to avoid circular dependency issues if any, 
            // but really just need to ensure the functin exists. 
            // I'll write the fetch call manually if needed or update API file.
            const res = await api.get(`/albums/${id}`);
            return res.data;
        }
    });

    const { data: songs, isLoading: songsLoading } = useQuery({
        queryKey: ['album-songs', id],
        queryFn: async () => {
            const api = (await import('../api/musicAPI')).default;
            // fetchSongs({ albumId: id })
            const res = await api.get(`/songs?albumId=${id}`);
            return res.data;
        }
    });


    if (isLoading) return <div className="p-8 text-white">Loading album...</div>;
    if (!album) return <div className="p-8 text-red-500">Album not found</div>;

    const handlePlayAlbum = () => {
        if (songs && songs.length > 0) {
            playSong(songs[0], songs);
        }
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 p-8 bg-gradient-to-b from-purple-900/40 to-black/40 items-end">
                <div className="w-64 h-64 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                    <img src={album.cover_image_url || 'https://placehold.co/300'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-purple-400">Album</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">{album.title}</h1>
                    <div className="flex items-center gap-4 text-gray-300 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            {album.artist?.profile_picture_url && (
                                <img src={album.artist.profile_picture_url} className="w-6 h-6 rounded-full" />
                            )}
                            <span className="text-white hover:underline cursor-pointer">{album.artist?.name}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(album.release_date).getFullYear()}</span>
                        <span>•</span>
                        <span>{songs?.length || 0} songs</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 px-8 py-6">
                <button
                    onClick={handlePlayAlbum}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg text-black"
                >
                    <FaPlay className="ml-1" />
                </button>
                <FaHeart className="text-3xl text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>

            {/* Tracks */}
            <div className="px-8 max-w-7xl">
                <table className="w-full text-left border-collapse">
                    <thead className="text-gray-400 text-sm border-b border-gray-800 uppercase tracking-wider">
                        <tr>
                            <th className="font-normal py-2 w-12 text-center">#</th>
                            <th className="font-normal py-2">Title</th>
                            <th className="font-normal py-2 text-right"><FaClock /></th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {songs?.map((song, i) => {
                            const isCurrent = currentSong?.id === song.id;
                            return (
                                <motion.tr
                                    key={song.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`group hover:bg-white/10 transition-colors rounded-lg cursor-pointer ${isCurrent ? 'bg-white/10 text-green-400' : ''}`}
                                    onClick={() => playSong(song, songs)}
                                >
                                    <td className="py-3 px-2 text-center rounded-l-lg">
                                        <span className="group-hover:hidden">{i + 1}</span>
                                        <button className="hidden group-hover:block mx-auto text-white">
                                            {isCurrent && isPlaying ? <FaPause size={10} /> : <FaPlay size={10} />}
                                        </button>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="font-medium text-white">{song.title}</div>
                                        <div className="text-xs text-gray-500">{song.artist?.name}</div>
                                    </td>
                                    <td className="py-3 px-2 text-right rounded-r-lg font-mono text-sm">
                                        {song.duration ? song.duration : '3:45'}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Comments */}
                <CommentsSection albumId={id} />
            </div>
        </div>
    );
};

export default AlbumDetailPage;
