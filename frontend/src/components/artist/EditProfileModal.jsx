import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateArtist } from '../../api/musicAPI'; // We need to check if this handles FormData for image
import { useUser } from '../../hooks/useUser';
import { FaTimes, FaCamera, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EditProfileModal = ({ onClose }) => {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profile_picture_url || null);

    const updateMutation = useMutation({
        mutationFn: (formData) => updateArtist(user.id, formData),
        onSuccess: () => {
            toast.success('Profile updated successfully!');
            queryClient.invalidateQueries(['artist-stats']);
            // We might need to refresh user context too if name/image changed there
            // But useUser might fetch from its own source. 
            // Ideally we re-fetch user.
            window.location.reload(); // Simple brute force for now to update context/header
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        if (image) {
            formData.append('image', image);
        }
        updateMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden relative"
            >
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Image Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer w-24 h-24">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-colors">
                                <img
                                    src={previewUrl || 'https://placehold.co/100'}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                <FaCamera className="text-white text-xl" />
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Artist Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="Your stage name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
                            placeholder="Tell your fans about yourself..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-gray-300 font-medium hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {updateMutation.isPending ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditProfileModal;
