import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMusic } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useEffect, useState, useRef } from 'react';

const LyricsDrawer = ({ isOpen, onClose, currentTime }) => {
    const { currentSong } = usePlayer();
    const [parsedLyrics, setParsedLyrics] = useState(null);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);
    const activeLineRef = useRef(null);

    // Parse LRC function
    const parseLRC = (lrcString) => {
        const lines = lrcString.split('\n');
        const result = [];
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

        for (const line of lines) {
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const milliseconds = parseInt(match[3], 10);
                const time = minutes * 60 + seconds + milliseconds / 1000;
                const text = line.replace(timeRegex, '').trim();
                result.push({ time, text });
            }
        }
        return result.length > 0 ? result : null;
    };

    // Update parsed lyrics when song changes
    useEffect(() => {
        if (currentSong?.lyrics) {
            const parsed = parseLRC(currentSong.lyrics);
            setParsedLyrics(parsed);
        } else {
            setParsedLyrics(null);
        }
        setActiveLineIndex(-1);
    }, [currentSong]);

    // Find active line based on currentTime
    useEffect(() => {
        if (!parsedLyrics) return;

        // Find the index of the line that has the greatest time <= currentTime
        let activeIndex = -1;
        for (let i = 0; i < parsedLyrics.length; i++) {
            if (parsedLyrics[i].time <= currentTime) {
                activeIndex = i;
            } else {
                break; // Because lyrics are sorted by time usually
            }
        }

        if (activeIndex !== activeLineIndex) {
            setActiveLineIndex(activeIndex);
        }
    }, [currentTime, parsedLyrics, activeLineIndex]);

    // Auto-scroll to active line
    useEffect(() => {
        if (activeLineRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeLineIndex]);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 z-[102] h-[80vh] md:h-[600px] md:w-[400px] md:right-4 md:left-auto md:bottom-24 md:rounded-3xl shadow-2xl flex flex-col ring-1 ring-white/5"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                    <FaMusic />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-white font-bold leading-none truncate max-w-[200px]">{currentSong?.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{currentSong?.artist?.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 text-center relative scroll-smooth">
                            {parsedLyrics ? (
                                <div className="py-10 space-y-6">
                                    {parsedLyrics.map((line, index) => (
                                        <p
                                            key={index}
                                            ref={index === activeLineIndex ? activeLineRef : null}
                                            className={`transition-all duration-500 transform cursor-pointer ${index === activeLineIndex
                                                    ? 'text-purple-400 text-2xl font-bold scale-105'
                                                    : 'text-gray-500 text-lg hover:text-gray-300'
                                                }`}
                                            onClick={() => {
                                                // Optional: Seek to this line if we had access to player control here
                                            }}
                                        >
                                            {line.text}
                                        </p>
                                    ))}
                                </div>
                            ) : currentSong?.lyrics ? (
                                <p className="text-gray-300 whitespace-pre-line leading-loose text-lg font-medium">
                                    {currentSong.lyrics}
                                </p>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                                    <FaMusic className="text-4xl opacity-20" />
                                    <p>No lyrics available for this track.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LyricsDrawer;
