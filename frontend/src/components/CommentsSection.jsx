import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/musicAPI'; // Need to add fetchComments/createComment to API
import { useUser } from '../hooks/useUser';
import { FaPaperPlane, FaTrash, FaUserCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Helper for relative time (could use date-fns)
const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const CommentsSection = ({ songId, albumId }) => {
    const [content, setContent] = useState('');
    const { user } = useUser();
    const queryClient = useQueryClient();

    // Construct query key based on resource
    const resourceKey = songId ? { songId } : { albumId };
    const queryKey = ['comments', resourceKey];

    const fetchComments = async () => {
        const params = new URLSearchParams(resourceKey).toString();
        const res = await api.get(`/comments?${params}`);
        return res.data;
    };

    const { data: comments, isLoading } = useQuery({
        queryKey,
        queryFn: fetchComments
    });

    const createMutation = useMutation({
        mutationFn: async (text) => {
            const res = await api.post('/comments', { content: text, ...resourceKey });
            return res.data;
        },
        onSuccess: () => {
            setContent('');
            queryClient.invalidateQueries(queryKey);
            toast.success('Comment posted');
        },
        onError: (err) => {
            toast.error('Failed to post: ' + (err.response?.data?.message || err.message));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/comments/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey);
            toast.success('Comment deleted');
        },
        onError: (err) => {
            toast.error('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        createMutation.mutate(content);
    };

    return (
        <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Comments</h3>

            {/* Input */}
            <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
                {user ? (
                    <>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                            {user.profile_picture_url ? (
                                <img src={user.profile_picture_url} className="w-full h-full object-cover" />
                            ) : (
                                <FaUserCircle className="text-gray-400 w-full h-full" />
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 resize-none h-24"
                                placeholder="Join the discussion..."
                            />
                            <button
                                type="submit"
                                disabled={createMutation.isPending || !content.trim()}
                                className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 disabled:opacity-50 transition-colors"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-gray-400 text-sm">Please login to comment.</div>
                )}
            </form>

            {/* List */}
            {isLoading ? (
                <div className="text-gray-500">Loading comments...</div>
            ) : (
                <div className="space-y-6">
                    {!comments?.length && <div className="text-gray-500 italic">No comments yet. Be the first!</div>}
                    {comments?.map(comment => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                                {comment.user?.profile_picture_url ? (
                                    <img src={comment.user.profile_picture_url} className="w-full h-full object-cover" />
                                ) : (
                                    <FaUserCircle className="text-gray-400 w-full h-full" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-bold text-sm">{comment.user?.name || 'Unknown'}</span>
                                    <span className="text-gray-500 text-xs">• {timeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                            </div>
                            {(user?.id === comment.userId || user?.role === 'admin') && (
                                <button
                                    onClick={() => deleteMutation.mutate(comment.id)}
                                    className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <FaTrash size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentsSection;
