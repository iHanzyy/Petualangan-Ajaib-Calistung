import { useState, useEffect, useCallback, useRef } from 'react';
import { Howl } from 'howler';

/**
 * Custom hook to handle background music for the game
 * 
 * @param {string} musicSrc - Path to the music file
 * @returns {Object} - Controls and state for background music
 */
const useBackgroundMusic = (musicSrc = '/assets/audio/background-music.mp3') => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const musicRef = useRef(null);

  // Initialize the music
  useEffect(() => {
    // Create the Howl instance for background music
    musicRef.current = new Howl({
      src: [musicSrc],
      loop: true,
      volume: volume,
      autoplay: false,
      preload: true,
    });

    // Cleanup
    return () => {
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current.unload();
      }
    };
  }, [musicSrc]);

  // Play music
  const play = useCallback(() => {
    if (musicRef.current && !isPlaying) {
      musicRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Pause music
  const pause = useCallback(() => {
    if (musicRef.current && isPlaying) {
      musicRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Set music volume
  const setMusicVolume = useCallback((value) => {
    const newVolume = Math.max(0, Math.min(1, value));
    setVolume(newVolume);
    if (musicRef.current) {
      musicRef.current.volume(newVolume);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (musicRef.current) {
        musicRef.current.mute(newMuted);
      }
      return newMuted;
    });
  }, []);

  return {
    play,
    pause,
    toggle,
    isPlaying,
    isMuted,
    volume,
    setVolume: setMusicVolume,
    toggleMute,
  };
};

export default useBackgroundMusic;