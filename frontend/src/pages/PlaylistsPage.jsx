import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlaylists, createPlaylist } from '../api/musicAPI';
import { FaPlus, FaMusic } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const PlaylistsPage = () => {
    const queryClient = useQueryClient();
    const { user, loading: userLoading } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    const { data: playlists, isLoading } = useQuery({
        queryKey: ['playlists'],
        queryFn: fetchPlaylists,
        enabled: !!user,
    });

    const createMutation = useMutation({
        mutationFn: createPlaylist,
        onSuccess: () => {
            queryClient.invalidateQueries(['playlists']);
            setShowModal(false);
            setNewPlaylistName('');
        },
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newPlaylistName) return;
        createMutation.mutate({ name: newPlaylistName, is_public: false });
    };

    if (userLoading) {
        return <div className="p-8 text-gray-400">Loading profile...</div>;
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="p-8 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                    <FaMusic className="text-6xl text-gray-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Your Library is Empty</h2>
                    <p className="text-gray-400">Log in to view your playlists and saved songs.</p>
                </div>
                <Link
                    to="/login"
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform inline-block shadow-lg shadow-white/10"
                >
                    Log In to Continue
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-24">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Your Library</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <FaPlus size={12} /> Create Playlist
                </button>
            </div>

            {isLoading && <p className="text-gray-400">Loading library...</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {playlists?.map((playlist, i) => (
                    <Link key={playlist.id} to={`/playlists/${playlist.id}`}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass p-4 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer hover:-translate-y-2 h-full"
                        >
                            <div className="aspect-square rounded-xl overflow-hidden mb-4 shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <FaMusic className="text-4xl text-gray-600 group-hover:text-purple-500 transition-colors" />
                            </div>
                            <h3 className="text-white font-semibold truncate text-md">{playlist.name}</h3>
                            <p className="text-gray-400 text-xs truncate mt-1">{playlist.songs?.length || 0} songs</p>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass p-8 rounded-2xl w-full max-w-md"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Create Playlist</h2>
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="My Awesome Playlist"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-300 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-bold transition-all disabled:opacity-50"
                                    >
                                        {createMutation.isPending ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlaylistsPage;
