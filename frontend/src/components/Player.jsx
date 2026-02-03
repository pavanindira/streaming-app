import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { usePlayer } from '../context/PlayerContext';
import { FaHeart, FaRegHeart, FaList, FaRandom, FaRedo, FaMicrophone, FaVolumeUp, FaVolumeDown, FaVolumeMute } from 'react-icons/fa';
import { useUser } from '../hooks/useUser';
import { useState, useEffect, useRef } from 'react';
import { fetchAudiobookProgress, saveAudiobookProgress, logPlay } from '../api/musicAPI';
import QueueDrawer from './QueueDrawer';
import LyricsDrawer from './LyricsDrawer';
import Visualizer from './Visualizer';

const Player = () => {
  const {
    currentSong,
    isPlaying,
    playPause,
    nextSong,
    prevSong,
    toggleShuffle,
    isShuffle,
    toggleRepeat,
    repeatMode,
    likedSongs,
    toggleLike
  } = usePlayer();
  const { user } = useUser();

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);

  const [showQueue, setShowQueue] = useState(false);
  const [volume, setVolume] = useState(1); // [NEW] Volume state
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.audio.current) {
      playerRef.current.audio.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      const newVol = volume || 1;
      setVolume(newVol);
      if (playerRef.current && playerRef.current.audio.current) playerRef.current.audio.current.volume = newVol;
      setIsMuted(false);
    } else {
      setVolume(0);
      if (playerRef.current && playerRef.current.audio.current) playerRef.current.audio.current.volume = 0;
      setIsMuted(true);
    }
  };

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
    if (currentSong && user) {
      // Simple fire and forget
      logPlay(currentSong.id).catch(err => console.error("Failed to log play", err));
    }
  }, [currentSong, user]);

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
    <div className="fixed bottom-0 left-0 right-0 z-[100] w-full">
      <div className="bg-[#12121a]/95 backdrop-blur-2xl border-t border-white/10 p-2 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-purple-500/10 blur-[60px] pointer-events-none rounded-full" />

        <div className="flex items-center justify-between gap-3 relative z-10 pl-4 pr-4 max-w-screen-2xl mx-auto">

          {/* Track Info */}
          <div className="flex items-center gap-3 w-[25%] min-w-0">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-xl group-hover:bg-purple-500/30 transition-colors"></div>
              <img
                src={currentSong.cover_image_url || 'https://placehold.co/50'}
                alt="Cover"
                className="w-12 h-12 rounded-lg object-cover shadow-lg border border-white/10 relative z-10"
              />
            </div>
            <div className="overflow-hidden min-w-0">
              <h4 className="text-white font-bold truncate text-sm tracking-wide">{currentSong.title}</h4>
              <p className="text-gray-400 text-[11px] font-medium truncate tracking-wide mt-0.5">{currentSong.artist?.name || 'Unknown Artist'}</p>
            </div>
            <button
              className={`ml-1 p-1.5 rounded-full hover:bg-white/10 transition-all active:scale-95 ${likedSongs.has(currentSong.id) ? 'text-purple-400' : 'text-gray-500 hover:text-white'}`}
              onClick={() => toggleLike(currentSong)}
            >
              {likedSongs.has(currentSong.id) ? <FaHeart size={14} className="drop-shadow-glow" /> : <FaRegHeart size={14} />}
            </button>
            {isPlaying && <div className="ml-3 h-10 w-24 flex items-center justify-center"><Visualizer isPlaying={isPlaying} /></div>}
          </div>

          {/* Audio Player Controls */}
          <div className="flex-1 max-w-2xl px-2">
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
              showVolumeControls={false}
              customVolumeControls={[]}
              layout="horizontal-reverse"
              customAdditionalControls={[]}
              style={{
                background: 'transparent',
                boxShadow: 'none',
                color: '#fff',
                padding: '0',
              }}
            />
          </div>

          {/* Volume / Extra Actions */}
          <div className="w-[25%] flex justify-end items-center gap-2">
            {/* Custom Volume Control */}
            <div className="flex items-center gap-1 group mr-2">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <FaVolumeMute size={14} /> : volume < 0.5 ? <FaVolumeDown size={14} /> : <FaVolumeUp size={14} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-110 transition-all opacity-0 group-hover:opacity-100 duration-200"
              />
            </div>

            <button
              className={`p-2 rounded-xl transition-all active:scale-95 ${isShuffle ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <FaRandom size={14} />
            </button>
            <button
              className={`p-2 rounded-xl transition-all active:scale-95 relative ${repeatMode !== 'off' ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
              onClick={toggleRepeat}
              title="Repeat"
            >
              <FaRedo size={14} />
              {repeatMode === 'one' && <span className="absolute top-1 right-1 text-[8px] bg-green-500 text-black px-0.5 rounded-full font-bold leading-none">1</span>}
            </button>
            <button
              className={`p-2 rounded-xl transition-all active:scale-95 ${showLyrics ? 'bg-purple-500/20 text-purple-400 shadow-glow' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
              onClick={() => setShowLyrics(!showLyrics)}
              title="Lyrics"
            >
              <FaMicrophone size={14} />
            </button>
            <button
              className={`p-2 rounded-xl transition-all active:scale-95 ${showQueue ? 'bg-purple-500/20 text-purple-400 shadow-glow' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
              onClick={() => setShowQueue(!showQueue)}
            >
              <FaList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CSS Override for Audio Player Sleek Look (Thinner & Single Line) */}
      <style>{`
        .rhap_container { outline: none; padding: 0 10px; }
        .rhap_controls-section { margin: 0; flex: 0 0 auto; margin-right: 20px; }
        .rhap_main-controls { gap: 12px; }
        .rhap_main-controls-button { color: #fff; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.9; }
        .rhap_main-controls-button:hover { opacity: 1; transform: scale(1.1); text-shadow: 0 0 10px rgba(255,255,255,0.3); }
        .rhap_play-pause-button { font-size: 28px !important; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; opacity: 1 !important; }
        .rhap_play-pause-button:hover { transform: scale(1.1); box-shadow: 0 0 25px rgba(255, 255, 255, 0.6); }
        
        .rhap_time { color: #9ca3af; font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 500; min-width: 35px; text-align: center; }
        
        .rhap_progress-section { display: flex; align-items: center; gap: 10px; flex: 1; }
        .rhap_progress-container { height: 3px; border-radius: 99px; background: rgba(255,255,255,0.1); cursor: pointer; transition: height 0.2s; flex: 1; }
        .rhap_progress-container:hover { height: 5px; }
        
        .rhap_progress-bar { height: 100%; border-radius: 99px; background: transparent; }
        .rhap_progress-filled { background: linear-gradient(90deg, #c084fc, #6366f1); border-radius: 99px; position: relative; }
        .rhap_progress-indicator { 
            background: #fff; 
            width: 8px; height: 8px; 
            top: 50%; transform: translate(-50%, -50%); 
            box-shadow: 0 0 10px rgba(192, 132, 252, 0.8); 
            opacity: 0; transition: opacity 0.2s, transform 0.2s;
        }
        .rhap_progress-container:hover .rhap_progress-indicator { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        
        .rhap_button-clear { border: none; background: transparent; }
        .rhap_volume-controls { justify-content: flex-end; margin-left: 10px; }
        .rhap_volume-bar-area { align-items: center; }
        .rhap_volume-bar { background: rgba(255,255,255,0.1); height: 3px; border-radius: 99px; }
        .rhap_volume-indicator { background: #fff; width: 8px; height: 8px; top: -2.5px; opacity: 0; transition: opacity 0.2s; }
        .rhap_volume-container:hover .rhap_volume-indicator { opacity: 1; }
        .rhap_volume-filled { background: #d8b4fe; border-radius: 99px; }
        
        /* Hide extra time display if needed */
        .rhap_total-time { display: none; }
        .rhap_volume-container { display: none !important; } 
      `}</style>

      <QueueDrawer isOpen={showQueue} onClose={() => setShowQueue(false)} />
      <LyricsDrawer
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        currentTime={currentTime}
      />
    </div>
  );
};

export default Player;
