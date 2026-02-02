import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchArtistById, fetchSongsByArtist, followUser, unfollowUser } from '../api/musicAPI'; // Ensure these are exported from API
import { usePlayer } from '../context/PlayerContext';
import { FaPlay, FaUser, FaCheck, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useUser } from '../hooks/useUser';

const ArtistDetailPage = () => {
    const { id } = useParams();
    const { playSong } = usePlayer();
    const { user: currentUser } = useUser();
    const queryClient = useQueryClient();

    // Fetch Artist Info
    const { data: artist, isLoading: artistLoading } = useQuery({
        queryKey: ['artist', id],
        queryFn: () => fetchArtistById(id),
    });

    // Fetch Artist Songs
    const { data: songs, isLoading: songsLoading } = useQuery({
        queryKey: ['artist-songs', id],
        queryFn: () => fetchSongsByArtist(id),
    });

    const isFollowing = artist?.isFollowing;

    const followMutation = useMutation({
        mutationFn: () => isFollowing ? unfollowUser(id) : followUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['artist', id]);
            toast.success(isFollowing ? 'Unfollowed' : 'Following');
        },
        onError: (err) => {
            toast.error('Action failed');
            console.error(err);
        }
    });

    if (artistLoading || songsLoading) return <p className="text-gray-400 p-8">Loading artist...</p>;

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                <div className="w-60 h-60 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 shrink-0 bg-gray-800">
                    {artist.profile_picture_url ? (
                        <img src={artist.profile_picture_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <FaUser className="text-6xl" />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-xs font-bold tracking-wider uppercase text-purple-400">Verified Artist</span>
                        <FaCheck className="text-purple-400 text-xs bg-white/10 rounded-full p-0.5" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">{artist.name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-300">
                        <span>{artist.followerCount} Followers</span>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                        <button
                            onClick={() => songs && songs.length > 0 && playSong(songs[0], songs)}
                            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <FaPlay /> Play
                        </button>

                        {currentUser && currentUser.id !== artist.id && (
                            <button
                                onClick={() => followMutation.mutate()}
                                disabled={followMutation.isPending}
                                className={`border font-bold py-3 px-8 rounded-full transition-all ${isFollowing
                                        ? 'border-gray-500 text-white hover:border-white'
                                        : 'border-white text-white hover:bg-white/10'
                                    }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Popular Songs */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Popular Songs</h2>
                <div className="space-y-1">
                    {songs?.map((song, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            key={song.id}
                            className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-3 rounded-md hover:bg-white/10 group items-center transition-colors cursor-pointer"
                            onClick={() => playSong(song, songs)}
                        >
                            <span className="text-gray-500 text-sm group-hover:hidden font-mono">{i + 1}</span>
                            <FaPlay className="text-white text-xs hidden group-hover:block" />

                            <div className="flex items-center gap-3 overflow-hidden">
                                <img src={song.cover_image_url || 'https://placehold.co/40'} alt="" className="w-10 h-10 rounded object-cover shadow-sm" />
                                <div>
                                    <p className="text-white font-medium truncate">{song.title}</p>
                                    <p className="text-gray-400 text-xs">{song.views || 0} plays</p>
                                </div>
                            </div>

                            <span className="text-gray-400 text-sm">
                                {/* Duration could go here */}
                            </span>
                        </motion.div>
                    ))}
                    {songs?.length === 0 && (
                        <p className="text-gray-500">No songs uploaded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtistDetailPage;
