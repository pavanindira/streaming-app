import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPlaylists, addSongToPlaylist } from '../api/musicAPI';
import { FaMusic, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AddToPlaylistModal = ({ song, onClose }) => {
    const { data: playlists } = useQuery({
        queryKey: ['playlists'],
        queryFn: fetchPlaylists,
    });

    const mutation = useMutation({
        mutationFn: ({ playlistId }) => addSongToPlaylist(playlistId, song.id),
        onSuccess: () => {
            toast.success('Song added to playlist!');
            onClose();
        },
        onError: (err) => {
            toast.error('Failed to add song: ' + (err.response?.data?.message || err.message));
        }
    });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass p-6 rounded-2xl w-full max-w-sm"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>

                <div className="mb-4">
                    <p className="text-gray-300 text-sm">Select a playlist for <span className="text-white font-medium">{song.title}</span>:</p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {playlists?.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No playlists found. Create one in Library!</p>}

                    {playlists?.map(playlist => (
                        <button
                            key={playlist.id}
                            onClick={() => mutation.mutate({ playlistId: playlist.id })}
                            disabled={mutation.isPending}
                            className="w-full text-left p-3 rounded-lg hover:bg-white/10 flex items-center gap-3 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-gray-400 group-hover:text-purple-400">
                                <FaMusic />
                            </div>
                            <div>
                                <p className="text-white font-medium truncate">{playlist.name}</p>
                                <p className="text-xs text-gray-500">{playlist.songs?.length || 0} songs</p>
                            </div>
                            {mutation.isPending && <span className="ml-auto text-xs text-purple-400">Adding...</span>}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default AddToPlaylistModal;
