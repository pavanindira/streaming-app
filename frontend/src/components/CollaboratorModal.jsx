import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { FaTimes, FaSearch, FaUserPlus, FaTrash, FaUser } from 'react-icons/fa';
import { fetchSearch, addCollaborator, removeCollaborator, fetchAllUsers } from '../api/musicAPI';
import toast from 'react-hot-toast';

const CollaboratorModal = ({ playlist, onClose, onUpdate }) => {
    const { user: currentUser } = useUser();
    const isOwner = playlist.user_id === currentUser?.id;

    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]); // All users for now, or search results

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUsers = async () => {
            if (query.trim().length < 2) {
                setUsers([]);
                return;
            }
            setLoading(true);
            try {
                const allUsers = await fetchAllUsers();
                const filtered = allUsers.filter(u =>
                    (u.name.toLowerCase().includes(query.toLowerCase()) ||
                        u.email.toLowerCase().includes(query.toLowerCase())) &&
                    u.id !== playlist.user_id // Exclude owner
                );
                setUsers(filtered);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(loadUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [query, playlist.user_id]);

    const handleAdd = async (userId) => {
        try {
            await addCollaborator(playlist.id, userId);
            toast.success('Collaborator added!');
            onUpdate(); // Refresh playlist data
        } catch (error) {
            toast.error('Failed to add collaborator');
            console.error(error);
        }
    };

    const handleRemove = async (userId) => {
        try {
            await removeCollaborator(playlist.id, userId);
            toast.success('Collaborator removed');
            onUpdate();
        } catch (error) {
            toast.error('Failed to remove collaborator');
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#181820] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-bold text-white">Collaborators</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto space-y-6">

                    {/* Current Collaborators */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Current Access</h4>
                        <div className="space-y-3">
                            {/* Owner */}
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                        {playlist.user?.name?.[0] || 'O'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{playlist.user?.name} (Owner)</p>
                                        <p className="text-xs text-blue-400">Admin</p>
                                    </div>
                                </div>
                            </div>

                            {playlist.collaborators?.map(user => {
                                const isSelf = user.id === currentUser?.id;
                                const canRemove = isOwner || isSelf;

                                return (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                {user.profile_picture_url ? (
                                                    <img src={user.profile_picture_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name?.[0] || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">
                                                    {user.username || user.name}
                                                    {isSelf && <span className="text-xs text-gray-500 ml-2">(You)</span>}
                                                </p>
                                                <p className="text-xs text-gray-500">Collaborator</p>
                                            </div>
                                        </div>
                                        {canRemove && (
                                            <button
                                                onClick={() => handleRemove(user.id)}
                                                className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                title={isSelf ? "Leave Playlist" : "Remove access"}
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Add New - Only for Owner */}
                    {
                        isOwner && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Invite Friends</h4>
                                <div className="relative mb-4">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {users.map(user => {
                                        const isAlreadyCollaborator = playlist.collaborators?.some(c => c.id === user.id);
                                        if (isAlreadyCollaborator) return null;

                                        return (
                                            <div key={user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-bold">
                                                        {user.name?.[0]}
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="text-white font-medium">{user.name}</p>
                                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAdd(user.id)}
                                                    className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all"
                                                >
                                                    <FaUserPlus size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {query.length >= 2 && users.length === 0 && !loading && (
                                        <p className="text-center text-gray-500 text-sm py-2">No users found.</p>
                                    )}
                                </div>
                            </div>
                        )
                    }

                </div >
            </div >
        </div >
    );
};

export default CollaboratorModal;
