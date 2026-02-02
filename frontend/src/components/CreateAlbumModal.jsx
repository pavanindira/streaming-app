import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/musicAPI';
import toast from 'react-hot-toast';

const CreateAlbumModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [type, setType] = useState('Album');
    const [coverFile, setCoverFile] = useState(null);
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await api.post('/albums', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['artist-albums']);
            toast.success('Album created successfully!');
            onClose();
        },
        onError: (err) => {
            toast.error('Creation failed: ' + (err.response?.data?.message || err.message));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        if (releaseDate) formData.append('release_date', releaseDate);
        formData.append('album_type', type);
        if (coverFile) formData.append('cover_image', coverFile);

        createMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">New Album</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Album Title</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                            placeholder="e.g. Greatest Hits"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Release Date</label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                value={releaseDate}
                                onChange={(e) => setReleaseDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="Album">Album</option>
                                <option value="EP">EP</option>
                                <option value="Single">Single</option>
                                <option value="Compilation">Compilation</option>
                            </select>
                        </div>
                    </div>

                    {/* Cover Art */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative shrink-0">
                            {coverFile ? (
                                <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" />
                            ) : (
                                <FaImage className="text-gray-500 text-2xl" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverFile(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <span className="block text-sm font-medium text-white mb-1">Cover Art</span>
                            <span className="text-xs text-gray-400 block">Required 500x500px or square image.</span>
                            <div className="mt-2 text-xs text-purple-400 font-medium">
                                {coverFile ? coverFile.name : 'Click box to upload'}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5">Cancel</button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Album'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateAlbumModal;
