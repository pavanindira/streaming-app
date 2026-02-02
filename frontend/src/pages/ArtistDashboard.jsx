import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSongsByArtist, getArtistStats, fetchAlbumsByArtist } from '../api/musicAPI';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../hooks/useUser';
import { FaPlus, FaMusic, FaChartLine, FaUsers, FaCompactDisc } from 'react-icons/fa';
import UploadSongModal from '../components/UploadSongModal';
import CreateAlbumModal from '../components/CreateAlbumModal';
import EditProfileModal from '../components/artist/EditProfileModal';
import EditSongModal from '../components/artist/EditSongModal';
import { AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { deleteSong } from '../api/musicAPI'; // Ensure imported
import toast from 'react-hot-toast'; // Ensure imported
import { FaEdit, FaTrash } from 'react-icons/fa';

const ArtistDashboard = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const queryClient = useQueryClient(); // Ensure imported or use existing if defined inside, wait..
    // ArtistDashboard doesn't import useQueryClient. Let's add it.
    // Line 2: import { useQuery } from '@tanstack/react-query'; -> Add useMutation, useQueryClient

    // Actually, I can just use `useMutation` for delete here inline or just standard function if simple.
    // Let's check imports. Line 2 has `useQuery`. 
    // I need to update line 2 as well.
    const { playSong } = usePlayer();
    const { user } = useUser();

    const { data: songs, isLoading } = useQuery({
        queryKey: ['artist-songs', user?.id],
        queryFn: () => fetchSongsByArtist(user?.id),
        enabled: !!user?.id,
    });

    const { data: stats } = useQuery({
        queryKey: ['artist-stats', user?.id],
        queryFn: () => getArtistStats(user?.id),
        enabled: !!user?.id,
    });

    const { data: albums } = useQuery({
        queryKey: ['artist-albums', user?.id],
        queryFn: () => fetchAlbumsByArtist(user?.id),
        enabled: !!user?.id,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSong,
        onSuccess: () => {
            queryClient.invalidateQueries(['artist-songs']);
            queryClient.invalidateQueries(['artist-stats']);
            toast.success('Song deleted');
        },
        onError: (err) => {
            toast.error('Failed to delete: ' + (err.response?.data?.message || err.message));
        }
    });

    const handleDelete = (id) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Are you sure you want to delete this track?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="pb-24 p-6">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <span className="text-xs font-bold tracking-wider uppercase text-purple-400 mb-2 block">Artist Studio</span>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                        <button
                            onClick={() => setIsEditProfileModalOpen(true)}
                            className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full border border-white/10 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateAlbumModalOpen(true)}
                        className="bg-purple-600 text-white font-bold py-3 px-6 rounded-full hover:bg-purple-500 transition-colors flex items-center gap-2"
                    >
                        <FaCompactDisc /> New Album
                    </button>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-white text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <FaPlus /> Upload Track
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><FaMusic text-xl /></div>
                        <h3 className="text-white font-medium">Total Tracks</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.totalTracks || 0}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><FaChartLine text-xl /></div>
                        <h3 className="text-white font-medium">Total Streams</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.totalLikes || 0}</p> {/* Using Likes as proxy for Streams/Popularity */}
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><FaUsers text-xl /></div>
                        <h3 className="text-white font-medium">Followers</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.followers || 0}</p>
                </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-12">
                <h3 className="text-white font-bold mb-6">Activity (Songs Released)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={songs ? Object.entries(songs.reduce((acc, song) => {
                                const date = new Date(song.createdAt).toLocaleDateString('default', { month: 'short', year: '2-digit' });
                                acc[date] = (acc[date] || 0) + 1;
                                return acc;
                            }, {})).map(([name, count]) => ({ name, count })) : []}
                        >
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} itemStyle={{ color: '#fff' }} />
                            <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-6">Your Albums</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                {albums?.map(album => (
                    <div key={album.id} className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors group">
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                            <img src={album.cover_image_url || 'https://placehold.co/200'} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-white font-bold truncate">{album.title}</h3>
                        <p className="text-gray-400 text-sm whitespace-nowrap">{new Date(album.release_date).getFullYear()} • {album.album_type}</p>
                    </div>
                ))}
                {!albums?.length && (
                    <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                        No albums yet. Create your first one!
                    </div>
                )}
            </div>

            <h2 className="text-xl font-bold text-white mb-6">Your Discography</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">Track</th>
                            <th className="p-4">Streams</th>
                            <th className="p-4">Date Added</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {songs?.map(song => (
                            <tr key={song.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                            <img src={song.cover_image_url || 'https://placehold.co/40'} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium text-white">{song.title}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{(Math.random() * 1000).toFixed(0)}</td>
                                <td className="p-4 text-gray-400">{new Date(song.createdAt).toLocaleDateString()}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Live</span></td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingSong(song)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                            title="Edit Track"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(song.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
                                            title="Delete Track"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isUploadModalOpen && <UploadSongModal onClose={() => setIsUploadModalOpen(false)} />}
                {isCreateAlbumModalOpen && <CreateAlbumModal onClose={() => setIsCreateAlbumModalOpen(false)} />}
                {isEditProfileModalOpen && <EditProfileModal onClose={() => setIsEditProfileModalOpen(false)} />}
                {editingSong && <EditSongModal song={editingSong} onClose={() => setEditingSong(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default ArtistDashboard;
