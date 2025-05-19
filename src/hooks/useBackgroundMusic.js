import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

// Variabel global untuk pelacakan status musik
let globalMusic = null;
let isInitializing = false;
let playAttemptInProgress = false;

/**
 * Custom hook to handle background music for the game
 * 
 * @returns {Object} - Controls and state for background music
 */
const useBackgroundMusic = () => {
  const musicRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize music once on mount
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (isInitializing) {
      // Jika proses inisialisasi sedang berjalan, atur reference ke musik global
      if (globalMusic) {
        musicRef.current = globalMusic;
      }
      return;
    }
    
    // Check if we already have global music instance or if we need to initialize
    if (!globalMusic) {
      isInitializing = true;
      
      try {
        globalMusic = new Howl({
          src: ['/sounds/background-music.mp3'],
          loop: true,
          volume: 0.5,
          autoplay: false,
          preload: true,
          html5: true,
          onload: () => {
            isInitializing = false;
            
            // Check state dari localStorage setelah musik berhasil dimuat
            const shouldPlay = localStorage.getItem('backgroundMusicPlaying') === 'true';
            if (shouldPlay && !globalMusic.playing()) {
              safePlayMusic();
            }
          },
          onloaderror: () => {
            isInitializing = false;
          },
          onplay: () => {
            setIsPlaying(true);
            playAttemptInProgress = false;
          },
          onpause: () => {
            setIsPlaying(false);
          },
          onstop: () => {
            setIsPlaying(false);
          },
          onend: () => {
            // Music should loop
          },
          onplayerror: () => {
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
      } catch {
        isInitializing = false;
      }
    }
    
    // Always set the music reference
    musicRef.current = globalMusic;
    
    // Clean up function not needed as we want the global music instance to persist
    return () => {};
  }, []);
  
  // Safe play function with debounce logic
  const safePlayMusic = () => {
    if (playAttemptInProgress) {
      return;
    }
    
    playAttemptInProgress = true;
    
    if (musicRef.current) {
      if (!musicRef.current.playing()) {
        const resumeAndPlay = () => {
          try {
            musicRef.current.play();
          } catch {
            playAttemptInProgress = false;
          }
        };
        
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume()
            .then(() => {
              resumeAndPlay();
            })
            .catch(() => {
              playAttemptInProgress = false;
              resumeAndPlay(); // Try anyway as last resort
            });
        } else {
          resumeAndPlay();
        }
        
        // Save state to localStorage
        localStorage.setItem('backgroundMusicPlaying', 'true');
      } else {
        playAttemptInProgress = false;
      }
    } else {
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