import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { updatePlaylist } from '../api/musicAPI';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const EditPlaylistModal = ({ playlist, onClose }) => {
    const [name, setName] = useState(playlist.name);
    const [description, setDescription] = useState(playlist.description || '');
    const [isPublic, setIsPublic] = useState(playlist.is_public);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data) => updatePlaylist(playlist.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['playlist', playlist.id]);
            queryClient.invalidateQueries(['playlists']);
            toast.success('Playlist updated!');
            onClose();
        },
        onError: () => toast.error('Failed to update playlist')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ name, description, is_public: isPublic });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Playlist</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 h-24"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="rounded bg-white/10 border-white/20 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-300">Public Playlist</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5">Cancel</button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 disabled:opacity-50"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditPlaylistModal;
