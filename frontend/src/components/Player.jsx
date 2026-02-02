import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../context/PlayerContext';
import { FaHeart, FaRegHeart, FaList, FaRandom, FaRedo, FaMicrophone } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { fetchAudiobookProgress, saveAudiobookProgress, logPlay } from '../api/musicAPI';
import QueueDrawer from './QueueDrawer';
import LyricsDrawer from './LyricsDrawer';
import Visualizer from './Visualizer';

const Player = () => {
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // [NEW] Track current time for lyrics
  const {
    currentSong,
    playPause,
    nextSong,
    prevSong,
    isPlaying,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    likedSongs,
    toggleLike
  } = usePlayer();

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);

  // Load progress for audiobooks
  useEffect(() => {
    const loadProgress = async () => {
      if (currentSong?.type === 'audiobook') {
        try {
          const data = await fetchAudiobookProgress(currentSong.id);
          if (data && data.progress_seconds > 0) {
            // Slight delay to ensure audio element is ready
            setTimeout(() => {
              if (playerRef.current && playerRef.current.audio.current) {
                playerRef.current.audio.current.currentTime = data.progress_seconds;
              }
            }, 500);
          }
        } catch (error) {
          console.error("Failed to load progress", error);
        }
      }
    };
    loadProgress();
    lastSaveTime.current = 0; // Reset save timer on song change
    setCurrentTime(0); // [NEW] Reset time on song change

    // Log Play for Activity Feed (after 5 seconds or immediately?)
    // Let's log immediately for simplicity, or maybe after 5s timeout to avoid skips?
    // User requested "Call logPlay when a song starts". 
    if (currentSong) {
      // Simple fire and forget
      logPlay(currentSong.id).catch(err => console.error("Failed to log play", err));
    }
  }, [currentSong]);

  const handleListen = (e) => {
    const time = e.target.currentTime;
    setCurrentTime(time); // [NEW] Update state

    // Save every 15 seconds
    if (currentSong?.type === 'audiobook' && (time - lastSaveTime.current > 15)) {
      saveAudiobookProgress(currentSong.id, {
        progress_seconds: Math.floor(time),
        is_completed: false
      });
      lastSaveTime.current = time;
    }
  };

  if (!currentSong) return null;

  const handlePlay = () => {
    if (!isPlaying) playPause(); // Sync state
  };

  const handlePause = () => {
    if (isPlaying) playPause(); // Sync state
  };

  // Construct valid URL
  let trackUrl = currentSong.file_url || currentSong.url;

  // Proxy MinIO URLs to avoid CORS/Network issues
  // Checks for: Localhost MinIO, Generic MinIO string, OR the specific bucket name (most reliable for your setup)
  if (trackUrl && (
    trackUrl.includes('127.0.0.1:9000') ||
    trackUrl.includes('minio') ||
    trackUrl.includes('/music-streaming/')
  )) {
    trackUrl = `/api/proxy?url=${encodeURIComponent(trackUrl)}`;
  }

  return (
    <div className="fixed bottom-[60px] md:bottom-0 w-full bg-black/90 backdrop-blur-lg border-t border-white/10 p-2 z-[100]">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">

        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4">
          {isPlaying && <div className="absolute bottom-1 right-1"><Visualizer isPlaying={isPlaying} /></div>}
          <img
            src={currentSong.cover_image_url || 'https://placehold.co/50'}
            alt="Cover"
            className="w-14 h-14 rounded-xl object-cover shadow-lg border border-white/10"
          />
          <div className="overflow-hidden">
            <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
            <p className="text-gray-400 text-sm truncate">{currentSong.artist?.name || 'Unknown Artist'}</p>
          </div>
          <button
            className={`hover:scale-110 transition-transform ${likedSongs.has(currentSong.id) ? 'text-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => toggleLike(currentSong)}
          >
            {likedSongs.has(currentSong.id) ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* Audio Player */}
        <div className="flex-1 max-w-2xl">
          <AudioPlayer
            ref={playerRef}
            autoPlay={isPlaying}
            src={trackUrl}
            onListen={handleListen}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={nextSong}
            onClickNext={nextSong}
            onClickPrevious={prevSong}
            showSkipControls={true}
            showJumpControls={false}
            customAdditionalControls={[
              <button
                key="shuffle"
                className={`mx-2 ${isShuffle ? 'text-green-500' : 'text-gray-400'}`}
                onClick={toggleShuffle}
              >
                <FaRandom />
              </button>,
              <button
                key="repeat"
                className={`mx-2 ${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400'}`}
                onClick={toggleRepeat}
              >
                <FaRedo />
                {repeatMode === 'one' && <span className="text-[10px] absolute">1</span>}
              </button>
            ]}
            style={{
              background: 'transparent',
              boxShadow: 'none',
              color: '#fff',
            }}
          />
        </div>

        {/* Volume / Extra */}
        <div className="w-1/4 flex justify-end gap-4">
          <button
            className={`transition-colors text-xl ${showLyrics ? 'text-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setShowLyrics(!showLyrics)}
            title="Lyrics"
          >
            <FaMicrophone />
          </button>
          <button
            className={`transition-colors text-xl ${showQueue ? 'text-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setShowQueue(!showQueue)}
          >
            <FaList />
          </button>
        </div>
      </div>

      {/* CSS Override for Audio Player Dark Mode */}
      <style>{`
        .rhap_container { padding: 10px 0; outline: none; }
        .rhap_time { color: #aaa; font-family: 'Outfit', sans-serif; font-size: 12px; }
        .rhap_progress-indicator { background: #fff; width: 12px; height: 12px; top: -4px; box-shadow: 0 0 10px rgba(255,255,255,0.5); }
        .rhap_progress-filled { background: linear-gradient(90deg, #a855f7, #6366f1); border-radius: 4px; }
        .rhap_download-progress { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .rhap_progress-bar { height: 4px; border-radius: 4px; }
        .rhap_button-clear { color: #e0e0e0; transition: all 0.2s; }
        .rhap_button-clear:hover { transform: scale(1.1); color: #fff; }
        .rhap_main-controls-button { color: #fff; }
      `}</style>

      <QueueDrawer isOpen={showQueue} onClose={() => setShowQueue(false)} />
      <LyricsDrawer
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        currentTime={currentTime} // [NEW] Pass time prop
      />
    </div>
  );
};

export default Player;
