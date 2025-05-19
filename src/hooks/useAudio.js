import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

/**
 * Custom hook to handle audio playback using Howler.js
 * 
 * @param {Object} sounds - Object with keys as sound names and values as file paths
 * @returns {Object} - Object containing play function to trigger sounds
 */
const useAudio = (sounds = {}) => {
  const soundsRef = useRef({});
  const playingRef = useRef([]);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);
  
  // Initialize sounds
  useEffect(() => {
    let isMounted = true;
    
    const initializeAudio = async () => {
      if (isLoading || initializedRef.current) return;
      setIsLoading(true);
      
      try {
        // Configure Howler
        Howler.autoUnlock = true;
        Howler.autoSuspend = false;
        
        // Create new sound instances with better error handling
        const soundPromises = Object.entries(sounds).map(([name, src]) => {
          return new Promise((resolve) => {
            // Ensure path starts with /
            const fullPath = src.startsWith('/') ? src : `/${src}`;
            console.log(`Loading sound ${name} from ${fullPath}`);
            
            // Test if file exists
            fetch(fullPath)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to load sound file: ${response.status} ${response.statusText}`);
                }
                console.log(`Sound file ${name} exists and is accessible`);
                
                const sound = new Howl({
                  src: [fullPath],
                  volume: 1.0,
                  preload: true,
                  html5: true,
                  onload: () => {
                    if (isMounted) {
                      console.log(`Sound ${name} loaded successfully`);
                      soundsRef.current[name] = sound;
                      resolve();
                    }
                  },
                  onloaderror: (id, err) => {
                    console.error(`Error loading sound ${name} from ${fullPath}:`, err);
                    if (isMounted) {
                      // Retry loading after a delay
                      setTimeout(() => {
                        console.log(`Retrying to load sound ${name} from ${fullPath}`);
                        sound.load();
                      }, 1000);
                    }
                  },
                  onplayerror: (id, err) => {
                    console.error(`Error playing sound ${name}:`, err);
                  }
                });
              })
              .catch(error => {
                console.error(`Error checking sound file ${name}:`, error);
                resolve(); // Resolve anyway to not block other sounds
              });
          });
        });
        
        await Promise.all(soundPromises);
        if (isMounted) {
          console.log('All sounds loaded successfully');
          initializedRef.current = true;
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
    const handleUserInteraction = async () => {
      console.log('User interaction detected, initializing audio');
      try {
        if (Howler.ctx && Howler.ctx.state !== 'running') {
          await Howler.ctx.resume();
          console.log('Audio context resumed successfully');
        }
        await initializeAudio();
      } catch (err) {
        console.error('Failed to initialize audio:', err);
      }
    };
    
    // Add interaction listeners
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    // Try to initialize immediately if context is already running
    if (Howler.ctx && Howler.ctx.state === 'running') {
      initializeAudio();
    }
    
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
      initializedRef.current = false;
    };
  }, [sounds, isLoading]);
  
  const play = useCallback((name) => {
    if (!isAudioReady) {
      console.warn('Audio not ready yet. Please wait for user interaction.');
      return null;
    }
    
    const sound = soundsRef.current[name];
    if (!sound) {
      console.warn(`Sound ${name} not found`);
      return null;
    }
    
    // Stop any currently playing sounds
    Object.values(soundsRef.current).forEach(s => {
      if (s !== sound && s.playing()) {
        s.stop();
      }
    });
    
    // Set volume based on sound type
    if (['correct', 'wrong'].includes(name)) {
      sound.volume(1.0); // Full volume for feedback sounds
    } else if (name === 'click') {
      sound.volume(0.8); // Slightly lower volume for click sounds
    }
    
    try {
      console.log(`Attempting to play sound ${name}`);
      const id = sound.play();
      console.log(`Sound ${name} started playing with id ${id}`);
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
