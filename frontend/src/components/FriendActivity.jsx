import { useQuery } from '@tanstack/react-query';
import { fetchFriendActivity } from '../api/musicAPI';
import { FaUser, FaMusic } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FriendActivity = () => {
    const { data: activity, isLoading } = useQuery({
        queryKey: ['friend-activity'],
        queryFn: fetchFriendActivity,
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) return <div className="p-4 text-center text-gray-500">Loading activity...</div>;

    return (
        <div className="hidden lg:block w-72 bg-black/40 border-l border-white/5 p-4 flex-shrink-0">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Friend Activity</h3>

            <div className="space-y-6">
                {activity?.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 group"
                    >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                            <img
                                src={item.user?.profile_picture_url || 'https://placehold.co/100'}
                                alt={item.user?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between">
                                <h4 className="text-white text-sm font-semibold truncate hover:underline cursor-pointer">
                                    {item.user?.name}
                                </h4>
                                <span className="text-[10px] text-gray-500">
                                    {new Date(item.played_at || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                                {item.song?.title}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                <FaMusic size={8} /> {item.song?.artist?.name}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {(!activity || activity.length === 0) && (
                    <div className="text-center text-gray-500 text-sm py-10">
                        <p>No activity yet.</p>
                        <p className="text-xs mt-2">Follow people to see what they're listening to!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendActivity;
