import { usePlayer } from '../context/PlayerContext';
import { FaMusic, FaPlay, FaTrash, FaBroom } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const QueueDrawer = ({ isOpen, onClose }) => {
    const { queue, currentSong, playSong, currentIndex, removeFromQueue, clearQueue } = usePlayer();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-80 glass border-l border-white/10 z-50 flex flex-col pt-20 pb-24 shadow-2xl"
                    >
                        <div className="px-6 mb-4 flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Queue</h2>
                                <p className="text-sm text-gray-400">{queue.length} Tracks</p>
                            </div>
                            {queue.length > 0 && (
                                <button
                                    onClick={clearQueue}
                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                                >
                                    <FaBroom /> Clear
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
                            {queue.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">
                                    <p>Queue is empty</p>
                                </div>
                            ) : (
                                queue.map((track, index) => {
                                    const isCurrent = index === currentIndex;
                                    return (
                                        <div
                                            key={index}
                                            className={`group p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${isCurrent
                                                ? 'bg-purple-600/20 border border-purple-500/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div
                                                className="flex-1 flex items-center gap-3 min-w-0"
                                                onClick={() => playSong(track, queue)}
                                            >
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={track.cover_image_url || 'https://placehold.co/40'}
                                                        alt={track.title}
                                                        className={`w-full h-full object-cover ${isCurrent ? 'opacity-50' : ''}`}
                                                    />
                                                    {isCurrent && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-medium truncate ${isCurrent ? 'text-purple-400' : 'text-gray-200'}`}>
                                                        {track.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {track.artist?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>

                                            {!isCurrent && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromQueue(track.id);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove from queue"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default QueueDrawer;
