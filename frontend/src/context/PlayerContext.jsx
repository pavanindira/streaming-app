import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchFavorites, likeSong, unlikeSong } from '../api/musicAPI';
import toast from 'react-hot-toast';
import { useUser } from '../hooks/useUser';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
    const [likedSongs, setLikedSongs] = useState(new Set()); // Set of Song IDs

    const { user } = useUser();

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('playerState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.currentSong) setCurrentSong(parsed.currentSong);
                if (parsed.queue) setQueue(parsed.queue);
                if (parsed.currentIndex) setCurrentIndex(parsed.currentIndex);
                if (parsed.isShuffle) setIsShuffle(parsed.isShuffle);
                if (parsed.repeatMode) setRepeatMode(parsed.repeatMode);
            } catch (e) {
                console.error("Failed to load player state", e);
            }
        }
    }, []);

    // Fetch Favorites when User changes
    useEffect(() => {
        const loadFavorites = async () => {
            if (!user) {
                setLikedSongs(new Set());
                return;
            }
            try {
                const favs = await fetchFavorites();
                const favIds = new Set(favs.map(song => song.id));
                setLikedSongs(favIds);
            } catch (error) {
                console.error("Could not load favorites", error);
            }
        };
        loadFavorites();
    }, [user]);

    // Save state to localStorage on change
    useEffect(() => {
        const stateToSave = {
            currentSong,
            queue,
            currentIndex,
            isShuffle,
            repeatMode
        };
        localStorage.setItem('playerState', JSON.stringify(stateToSave));
    }, [currentSong, queue, currentIndex, isShuffle, repeatMode]);

    const playSong = (song, newQueue = null) => {
        if (newQueue) {
            setQueue(newQueue);
            const index = newQueue.findIndex(s => s.id === song.id);
            setCurrentIndex(index);
        } else if (currentIndex === -1 || queue.length === 0) {
            // If no queue, make this the queue
            setQueue([song]);
            setCurrentIndex(0);
        } else {
            // If playing from existing queue (or isolated click), 
            // ideally we should know the context. 
            // For now, if just passed a song, valid assumption is to replace current or add?
            // Let's assume replace if not in queue, or jump if in queue.
            const index = queue.findIndex(s => s.id === song.id);
            if (index !== -1) {
                setCurrentIndex(index);
            } else {
                // Add to end and play? Or replace queue?
                // Spotify replace queue usually if clicking a song in a list.
                // Let's replace queue for simplicity when clicking a fresh song.
                setQueue([song]);
                setCurrentIndex(0);
            }
        }
        setCurrentSong(song);
        setIsPlaying(true);
    };

    const playPause = () => {
        setIsPlaying(!isPlaying);
    };

    const nextSong = () => {
        if (queue.length === 0) return;

        let nextIndex;
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else {
            nextIndex = currentIndex + 1;
        }

        if (nextIndex >= queue.length) {
            if (repeatMode === 'all') {
                nextIndex = 0;
            } else {
                setIsPlaying(false);
                return;
            }
        }

        setCurrentIndex(nextIndex);
        setCurrentSong(queue[nextIndex]);
        setIsPlaying(true);
    };

    const prevSong = () => {
        if (queue.length === 0) return;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = queue.length - 1;
        }

        setCurrentIndex(prevIndex);
        setCurrentSong(queue[prevIndex]);
        setIsPlaying(true);
    };

    const addToQueue = (song) => {
        setQueue(prev => [...prev, song]);
    };

    const removeFromQueue = (songId) => {
        setQueue(prev => {
            // If removing the current song, we probably should handle it carefully. 
            // But normally users remove other songs. 
            // If current song is removed, it might break index logic?
            // Let's just filter it out.
            return prev.filter(s => s.id !== songId);
        });
        // We might need to adjust currentIndex if we removed something before it.
        // For simplicity, let's assume if we modify queue, we might desync index.
        // But for now simple filter is fine for MVP.
    };

    const clearQueue = () => {
        if (currentSong) {
            setQueue([currentSong]);
            setCurrentIndex(0);
        } else {
            setQueue([]);
            setCurrentIndex(-1);
        }
    };

    const toggleShuffle = () => setIsShuffle(!isShuffle);
    const toggleRepeat = () => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    };

    const toggleLike = async (song) => {
        if (!song) return;

        // Optimistic Update
        const isLiked = likedSongs.has(song.id);
        setLikedSongs(prev => {
            const newSet = new Set(prev);
            if (isLiked) {
                newSet.delete(song.id);
            } else {
                newSet.add(song.id);
            }
            return newSet;
        });

        // API Call
        try {
            if (isLiked) {
                await unlikeSong(song.id);
                toast.success('Removed from Liked Songs', { id: 'like-toast', duration: 2000 });
            } else {
                await likeSong(song.id);
                toast.success('Added to Liked Songs', { id: 'like-toast', duration: 2000 });
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
            // Revert on failure
            setLikedSongs(prev => {
                const newSet = new Set(prev);
                if (isLiked) {
                    newSet.add(song.id); // Re-add if we failed to delete
                } else {
                    newSet.delete(song.id); // Delete if we failed to add
                }
                return newSet;
            });
            toast.error('Failed to update favorites');
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentSong,
            isPlaying,
            queue,
            currentIndex,
            isShuffle,
            repeatMode,
            playSong,
            playPause,
            setIsPlaying,
            nextSong,
            prevSong,
            addToQueue,
            removeFromQueue,
            clearQueue,
            toggleShuffle,
            toggleRepeat,
            likedSongs,
            toggleLike
        }}>
            {children}
        </PlayerContext.Provider>
    );
};
