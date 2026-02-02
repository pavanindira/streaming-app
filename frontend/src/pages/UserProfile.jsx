import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchArtistById, followUser, unfollowUser } from '../api/musicAPI'; // fetchArtistById hits /users/:id
import { useUser } from '../hooks/useUser';
import { usePlayer } from '../context/PlayerContext';
import { FaUser, FaHeart, FaPlay, FaPause } from 'react-icons/fa';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useUser();
    const { currentSong, isPlaying, playSong, pauseSong } = usePlayer();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('favorites');

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['user-profile', id],
        queryFn: () => fetchArtistById(id)
    });

    const followMutation = useMutation({
        mutationFn: () => followUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-profile', id]);
        }
    });

    const unfollowMutation = useMutation({
        mutationFn: () => unfollowUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-profile', id]);
        }
    });

    const handleFollowToggle = () => {
        if (profile?.isFollowing) {
            unfollowMutation.mutate();
        } else {
            followMutation.mutate();
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;
    if (error) return <div className="p-8 text-center text-red-500">User not found</div>;

    const isMe = currentUser?.id === parseInt(id);

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="relative h-64 bg-gradient-to-b from-purple-900/50 to-black/50">
                <div className="absolute bottom-0 left-0 w-full p-8 flex items-end gap-6 bg-gradient-to-t from-black to-transparent">
                    <div className="w-40 h-40 rounded-full border-4 border-black overflow-hidden bg-gray-800 flex items-center justify-center shadow-2xl">
                        {profile.profile_picture_url ? (
                            <img src={profile.profile_picture_url} className="w-full h-full object-cover" alt={profile.name} />
                        ) : (
                            <FaUser className="text-6xl text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1 mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-green-400 mb-1 block">Profile</span>
                        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-lg">{profile.name}</h1>
                        <div className="flex items-center gap-4 text-gray-300 text-sm">
                            <span>@{profile.username}</span>
                            <span>•</span>
                            <span className="text-white font-bold">{profile.followerCount} Followers</span>
                        </div>
                    </div>
                    {!isMe && (
                        <div className="mb-4">
                            <button
                                onClick={handleFollowToggle}
                                disabled={followMutation.isPending || unfollowMutation.isPending}
                                className={`px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all ${profile.isFollowing
                                        ? 'bg-transparent border border-gray-400 text-white hover:border-white'
                                        : 'bg-white text-black hover:scale-105'
                                    }`}
                            >
                                {profile.isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-8 max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-800 mb-8">
                    {['favorites', 'listening history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider relative ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'favorites' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white mb-6">Favorite Tracks</h2>
                        {!profile.favorites?.length && (
                            <div className="text-gray-500 italic">No favorites yet.</div>
                        )}
                        {profile.favorites?.map((song, index) => (
                            <div key={song.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                <div className="text-gray-500 w-8 text-center text-lg">{index + 1}</div>
                                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                    <img src={song.cover_image_url || 'https://placehold.co/50'} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => playSong(song)}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaPlay className="text-white text-xs" />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate">{song.title}</div>
                                    <div className="text-gray-400 text-sm truncate">{song.artist?.name || 'Unknown Artist'}</div>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <FaHeart className="text-green-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'listening history' && (
                    <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-2">Activities coming soon!</h3>
                        <p className="text-gray-500">Listening history is not public yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
