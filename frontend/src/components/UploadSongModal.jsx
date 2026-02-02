import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api, { fetchAlbumsByArtist } from '../api/musicAPI';
import toast from 'react-hot-toast';
import { useUser } from '../hooks/useUser';

const UploadSongModal = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [album, setAlbum] = useState('');
    const [genre, setGenre] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const queryClient = useQueryClient();
    const { user } = useUser();

    const { data: albums } = useQuery({
        queryKey: ['artist-albums', user?.id],
        queryFn: () => fetchAlbumsByArtist(user?.id),
        enabled: !!user?.id,
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await api.post('/songs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['songs']);
            queryClient.invalidateQueries(['artist-songs']); // If we have this query
            toast.success('Song uploaded successfully!');
            onClose();
        },
        onError: (err) => {
            toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!audioFile) {
            toast.error('Please select an audio file');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', audioFile);
        formData.append('file', audioFile);
        if (coverFile) formData.append('cover_image', coverFile);
        if (album) formData.append('album_id', album);
        if (album) formData.append('album_id', album);
        if (genre) formData.append('genre', genre);
        if (lyrics) formData.append('lyrics', lyrics);

        uploadMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Upload New Track</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                            placeholder="Song Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                placeholder="e.g. Pop"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Album (Optional)</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                value={album}
                                onChange={(e) => setAlbum(e.target.value)}
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
                            <label className="block text-sm font-medium text-gray-400">Lyrics (Optional)</label>
                            <span className="text-xs text-purple-400">Supported: LRC Format [mm:ss.xx] for sync</span>
                        </div>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 min-h-[100px] font-mono text-sm"
                            placeholder={"[00:12.50] Lyric line 1\n[00:16.00] Lyric line 2..."}
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                        />
                    </div>

                    {/* Audio File */}
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer relative bg-white/5">
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <FaCloudUploadAlt className="text-4xl text-purple-500" />
                            {audioFile ? (
                                <span className="text-white font-medium truncate max-w-[200px]">{audioFile.name}</span>
                            ) : (
                                <>
                                    <span className="text-white font-medium">Click to upload audio</span>
                                    <span className="text-xs text-gray-400">MP3, WAV, FLAC (Max 20MB)</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Cover Art */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative shrink-0">
                            {coverFile ? (
                                <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" />
                            ) : (
                                <FaImage className="text-gray-500 text-xl" />
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
                        </div>
                    </div>


                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5">Cancel</button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={uploadMutation.isPending}
                        >
                            {uploadMutation.isPending ? 'Uploading...' : 'Publish Track'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UploadSongModal;
