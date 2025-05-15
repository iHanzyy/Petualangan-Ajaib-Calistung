import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

/**
 * Custom hook to handle audio playback using Howler.js
 * 
 * @param {Object} sounds - Object with keys as sound names and values as file paths
 * @returns {Object} - Object containing play function to trigger sounds
 */
const useAudio = (sounds) => {
  const soundsRef = useRef({});
  const playingRef = useRef([]);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize sounds
  useEffect(() => {
    let isMounted = true;
    
    const initializeAudio = async () => {
      if (isLoading) return;
      setIsLoading(true);
      
      try {
        // Unload any existing sounds first
        Object.values(soundsRef.current).forEach(sound => {
          if (sound && sound.unload) {
            sound.unload();
          }
        });
        
        // Configure Howler
        Howler.autoUnlock = true;
        Howler.autoSuspend = false;
        
        // Create new sound instances with better error handling
        const soundPromises = Object.entries(sounds).map(([name, src]) => {
          return new Promise((resolve) => {
            const sound = new Howl({
              src: [src],
              volume: 0.7,
              preload: true,
              html5: true,
              onload: () => {
                if (isMounted) {
                  soundsRef.current[name] = sound;
                  resolve();
                }
              },
              onloaderror: (id, err) => {
                console.warn(`Error loading sound ${name}:`, err);
                if (isMounted) {
                  // Retry loading after a delay
                  setTimeout(() => {
                    sound.load();
                  }, 1000);
                }
              }
            });
          });
        });
        
        await Promise.all(soundPromises);
        if (isMounted) {
          setIsAudioReady(true);
        }
      } catch (error) {
        console.error('Error initializing sounds:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Initialize audio after user interaction
    const handleUserInteraction = () => {
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        Howler.ctx.resume();
      }
      initializeAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    
    // Add interaction listeners
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      isMounted = false;
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      
      // Cleanup sounds
      Object.values(soundsRef.current).forEach(sound => {
        if (sound && sound.unload) {
          sound.unload();
        }
      });
      
      soundsRef.current = {};
      playingRef.current = [];
    };
  }, [sounds, isLoading]);
  
  const play = useCallback((name) => {
    if (!isAudioReady) {
      console.warn('Audio not ready yet. Please wait for user interaction.');
      return null;
    }
    
    const sound = soundsRef.current[name];
    if (!sound) return null;
    
    // Handle special cases
    if (['correct', 'wrong', 'gameOver'].includes(name)) {
      Object.values(soundsRef.current).forEach(s => {
        if (s !== sound && s.playing()) {
          s.stop();
        }
      });
      sound.volume(0.9);
    }
    
    if (name === 'click') {
      sound.volume(0.5);
    }
    
    try {
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        Howler.ctx.resume();
      }
      const id = sound.play();
      playingRef.current.push(id);
      return id;
    } catch (err) {
      console.warn(`Error playing sound ${name}:`, err);
      return null;
    }
  }, [isAudioReady]);
  
  const stopAll = useCallback(() => {
    Object.values(soundsRef.current).forEach(sound => {
      if (sound && sound.stop) {
        sound.stop();
      }
    });
    playingRef.current = [];
  }, []);
  
  return { play, stopAll, isAudioReady, isLoading };
};

export default useAudio;
