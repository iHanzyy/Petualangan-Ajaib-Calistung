import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

// Variabel global untuk pelacakan status musik
let globalMusic = null;
let isInitializing = false;
let instanceCount = 0;
let playAttemptInProgress = false;

/**
 * Custom hook to handle background music for the game
 * 
 * @returns {Object} - Controls and state for background music
 */
const useBackgroundMusic = () => {
  const musicRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hookId = useRef(`instance-${++instanceCount}`);
  
  // Log untuk debugging
  console.log(`useBackgroundMusic hook instantiated: ${hookId.current}`);
  
  // Initialize music once on mount
  useEffect(() => {
    console.log(`[${hookId.current}] useBackgroundMusic effect running`);
    
    // Prevent multiple initialization attempts
    if (isInitializing) {
      console.log(`[${hookId.current}] Another initialization is in progress, waiting`);
      
      // Jika proses inisialisasi sedang berjalan, atur reference ke musik global
      if (globalMusic) {
        musicRef.current = globalMusic;
      }
      return;
    }
    
    // Check if we already have global music instance or if we need to initialize
    if (!globalMusic) {
      isInitializing = true;
      console.log(`[${hookId.current}] Creating new background music instance`);
      
      try {
        globalMusic = new Howl({
          src: ['/sounds/background-music.mp3'],
          loop: true,
          volume: 0.5,
          autoplay: false,
          preload: true,
          html5: true,
          onload: () => {
            console.log(`[${hookId.current}] Music loaded successfully`);
            isInitializing = false;
            
            // Check state dari localStorage setelah musik berhasil dimuat
            const shouldPlay = localStorage.getItem('backgroundMusicPlaying') === 'true';
            if (shouldPlay && !globalMusic.playing()) {
              console.log(`[${hookId.current}] Auto-playing music based on localStorage state`);
              safePlayMusic();
            }
          },
          onloaderror: (id, err) => {
            console.error(`[${hookId.current}] Error loading music:`, err);
            isInitializing = false;
          },
          onplay: () => {
            console.log(`[${hookId.current}] Music playing`);
            setIsPlaying(true);
            playAttemptInProgress = false;
          },
          onpause: () => {
            console.log(`[${hookId.current}] Music paused`);
            setIsPlaying(false);
          },
          onstop: () => {
            console.log(`[${hookId.current}] Music stopped`);
            setIsPlaying(false);
          },
          onend: () => {
            console.log(`[${hookId.current}] Music ended (should loop)`);
          },
          onplayerror: (id, err) => {
            console.error(`[${hookId.current}] Error playing music:`, err);
            playAttemptInProgress = false;
            
            // Try to recover
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
              Howler.ctx.resume().then(() => {
                globalMusic.once('unlock', function() {
                  globalMusic.play();
                });
              });
            }
          }
        });
      } catch (error) {
        console.error(`[${hookId.current}] Exception creating Howl:`, error);
        isInitializing = false;
      }
    } else {
      console.log(`[${hookId.current}] Using existing music instance`);
    }
    
    // Always set the music reference
    musicRef.current = globalMusic;
    
    // Clean up function not needed as we want the global music instance to persist
    return () => {
      console.log(`[${hookId.current}] useBackgroundMusic unmounting, but keeping global instance`);
    };
  }, []);
  
  // Safe play function with debounce logic
  const safePlayMusic = () => {
    if (playAttemptInProgress) {
      console.log(`[${hookId.current}] Play attempt already in progress, skipping`);
      return;
    }
    
    playAttemptInProgress = true;
    
    if (musicRef.current) {
      if (!musicRef.current.playing()) {
        console.log(`[${hookId.current}] Attempting to play music`);
        
        const resumeAndPlay = () => {
          try {
            musicRef.current.play();
          } catch (e) {
            console.error(`[${hookId.current}] Error playing music:`, e);
            playAttemptInProgress = false;
          }
        };
        
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          console.log(`[${hookId.current}] Audio context suspended, resuming first`);
          Howler.ctx.resume()
            .then(() => {
              console.log(`[${hookId.current}] Audio context resumed successfully`);
              resumeAndPlay();
            })
            .catch(err => {
              console.error(`[${hookId.current}] Failed to resume audio context:`, err);
              playAttemptInProgress = false;
              resumeAndPlay(); // Try anyway as last resort
            });
        } else {
          resumeAndPlay();
        }
        
        // Save state to localStorage
        localStorage.setItem('backgroundMusicPlaying', 'true');
      } else {
        console.log(`[${hookId.current}] Music is already playing, no action taken`);
        playAttemptInProgress = false;
      }
    } else {
      console.error(`[${hookId.current}] Music reference is not initialized`);
      playAttemptInProgress = false;
    }
  };

  const playMusic = () => {
    // Menambahkan timeout kecil untuk menghindari multiple calls dalam timing yang sama
    setTimeout(() => {
      safePlayMusic();
    }, 50);
  };

  const pauseMusic = () => {
    if (musicRef.current && musicRef.current.playing()) {
      console.log(`[${hookId.current}] Pausing music`);
      musicRef.current.pause();
      localStorage.setItem('backgroundMusicPlaying', 'false');
    }
  };

  const setVolume = (volume) => {
    if (musicRef.current) {
      musicRef.current.volume(volume);
    }
  };

  // Check if music is currently playing
  const isMusicPlaying = () => {
    return musicRef.current ? musicRef.current.playing() : false;
  };

  return { 
    playMusic, 
    pauseMusic, 
    setVolume, 
    isMusicPlaying, 
    isPlaying, 
    getMusicInstance: () => musicRef.current 
  };
};

export default useBackgroundMusic;