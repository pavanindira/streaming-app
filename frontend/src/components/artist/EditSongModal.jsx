import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSave, FaImage } from 'react-icons/fa';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api, { fetchAlbumsByArtist, updateSong } from '../../api/musicAPI';
import toast from 'react-hot-toast';
import { useUser } from '../../hooks/useUser';

const EditSongModal = ({ song, onClose }) => {
    const [title, setTitle] = useState(song.title);
    const [albumId, setAlbumId] = useState(song.albumId || '');
    const [genre, setGenre] = useState(song.genre || '');
    const [lyrics, setLyrics] = useState(song.lyrics || '');
    const [coverFile, setCoverFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(song.cover_image_url);

    const queryClient = useQueryClient();
    const { user } = useUser();

    const { data: albums } = useQuery({
        queryKey: ['artist-albums', user?.id],
        queryFn: () => fetchAlbumsByArtist(user?.id),
        enabled: !!user?.id,
    });

    const updateMutation = useMutation({
        mutationFn: async (formData) => {
            // updateSong uses api.put('/songs/:id', data)
            // If we have file, we need FormData. check api wrapper.
            // musicAPI.jsx: export const updateSong = async (id, songData) => { ... api.put ... }
            // It expects songData.
            return updateSong(song.id, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['artist-songs']);
            toast.success('Song updated successfully!');
            onClose();
        },
        onError: (err) => {
            toast.error('Update failed: ' + (err.response?.data?.message || err.message));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        if (albumId) formData.append('album_id', albumId);
        if (genre) formData.append('genre', genre);
        if (lyrics) formData.append('lyrics', lyrics);
        if (coverFile) formData.append('cover_image', coverFile);

        updateMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Track</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Album</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                value={albumId}
                                onChange={(e) => setAlbumId(e.target.value)}
                            >
                                <option value="">Single (No Album)</option>
                                {albums?.map(a => (
                                    <option key={a.id} value={a.id}>{a.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Lyrics */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-gray-400">Lyrics</label>
                            <span className="text-xs text-purple-400">Supported: LRC Format [mm:ss.xx] for sync</span>
                        </div>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 min-h-[100px] font-mono text-sm"
                            placeholder={"[00:12.50] Lyric line 1\n[00:16.00] Lyric line 2..."}
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                        />
                    </div>

                    {/* Cover Art */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative shrink-0">
                            <img
                                src={coverFile ? URL.createObjectURL(coverFile) : (previewUrl || 'https://placehold.co/80')}
                                className="w-full h-full object-cover"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setCoverFile(e.target.files[0]);
                                    setPreviewUrl(null);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <span className="block text-sm font-medium text-white mb-1">Update Cover Art</span>
                            <span className="text-xs text-gray-400 block">Click image to change</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5">Cancel</button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditSongModal;
