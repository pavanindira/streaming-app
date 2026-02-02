import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlaylistById, removeSongFromPlaylist } from '../api/musicAPI';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import api from '../api/musicAPI';
import { useState } from 'react';
import EditPlaylistModal from '../components/EditPlaylistModal';
import CollaboratorModal from '../components/CollaboratorModal';
import { FaPlay, FaTrash, FaMusic, FaPen, FaClock, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PlaylistDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playSong } = usePlayer();
    const { onSelect } = useOutletContext() || {};
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

    const { data: playlist, isLoading, error } = useQuery({
        queryKey: ['playlist', id],
        queryFn: () => fetchPlaylistById(id),
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/playlists/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['playlists']);
            navigate('/library');
            toast.success('Playlist deleted');
        },
        onError: () => toast.error('Failed to delete playlist')
    });

    const removeSongMutation = useMutation({
        mutationFn: async (songId) => {
            await removeSongFromPlaylist(id, songId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['playlist', id]);
            toast.success('Song removed');
        },
        onError: () => toast.error('Failed to remove song')
    });

    if (isLoading) return <p className="text-gray-400 p-8">Loading playlist...</p>;
    if (error) return <p className="text-red-400 p-8">Error loading playlist.</p>;

    const { user } = useUser();
    // Check if current user is owner
    const isOwner = user?.id === playlist.user_id;

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                <div className="w-60 h-60 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-2xl flex items-center justify-center shrink-0">
                    <FaMusic className="text-6xl text-gray-500" />
                </div>
                <div className="flex-1 space-y-4">
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-400">Playlist</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">{playlist.name}</h1>
                    <p className="text-gray-400 text-lg">{playlist.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="font-bold text-white">{playlist.user?.username || 'You'}</span>
                        <span>• {playlist.songs?.length || 0} songs</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-8">
                {playlist.songs?.length > 0 && (
                    <button
                        onClick={() => playSong(playlist.songs[0], playlist.songs)}
                        className="bg-purple-600 hover:bg-purple-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                        <FaPlay className="pl-1 text-xl" />
                    </button>
                )}

                {/* Owner Actions */}
                {isOwner && (
                    <>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-gray-400 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
                            title="Edit Details"
                        >
                            <FaPen />
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this playlist?')) {
                                    deleteMutation.mutate();
                                }
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-3 rounded-full hover:bg-white/10"
                            title="Delete Playlist"
                        >
                            <FaTrash />
                        </button>
                    </>
                )}

                {/* Collaboration Button - Visible to Owner AND Collaborators */}
                {(isOwner || playlist.collaborators?.some(c => c.id === user?.id)) && (
                    <button
                        onClick={() => setIsCollaboratorModalOpen(true)}
                        className="text-gray-400 hover:text-blue-400 transition-colors p-3 rounded-full hover:bg-white/10"
                        title={isOwner ? "Manage Collaborators" : "View Collaborators"}
                    >
                        <FaUsers />
                    </button>
                )}
            </div>

            {/* Song List */}
            <div className="space-y-1">
                {/* Headings */}
                <div className="grid grid-cols-[16px_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 mb-2 font-medium">
                    <span>#</span>
                    <span>Title</span>
                    <span>Artist</span>
                    <span className="text-right w-8"><FaClock /></span>
                </div>

                {playlist.songs?.map((song, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        key={song.id}
                        className="grid grid-cols-[16px_1fr_1fr_auto] gap-4 px-4 py-3 rounded-md hover:bg-white/10 group items-center transition-colors cursor-pointer"
                        onClick={() => playSong(song, playlist.songs)}
                    >
                        <span className="text-gray-500 text-sm group-hover:hidden font-mono">{i + 1}</span>
                        <FaPlay className="text-white text-xs hidden group-hover:block" />

                        <div className="flex items-center gap-3 overflow-hidden">
                            {song.cover_image_url && <img src={song.cover_image_url} alt="" className="w-10 h-10 rounded object-cover shadow-sm" />}
                            <span className="text-white font-medium truncate">{song.title}</span>
                        </div>

                        <span className="text-gray-400 text-sm truncate hover:text-white transition-colors">{song.artist?.name || 'Unknown'}</span>

                        {isOwner || (playlist.collaborators?.some(c => c.id === user?.id)) ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeSongMutation.mutate(song.id);
                                }}
                                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                                title="Remove from playlist"
                            >
                                <FaTrash />
                            </button>
                        ) : (
                            <span className="w-8"></span>
                        )}
                    </motion.div>
                ))}

                {playlist.songs?.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        This playlist is empty. Go find some songs!
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <EditPlaylistModal
                        playlist={playlist}
                        onClose={() => setIsEditModalOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCollaboratorModalOpen && (
                    <CollaboratorModal
                        playlist={playlist}
                        onClose={() => setIsCollaboratorModalOpen(false)}
                        onUpdate={() => queryClient.invalidateQueries(['playlist', id])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlaylistDetailPage;
