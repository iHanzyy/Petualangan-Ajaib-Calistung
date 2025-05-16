import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

// Membuat instance musik global agar tetap ada saat berpindah halaman
let globalMusic = null;

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
    // Check if we already have global music instance or if we need to initialize
    if (!globalMusic) {
      globalMusic = new Howl({
        src: ['/sounds/background-music.mp3'],
        loop: true,
        volume: 0.5,
        autoplay: false,
        preload: true, // Make sure audio is preloaded
        html5: true, // Use HTML5 Audio to avoid some mobile browser limitations
        onplay: () => {
          setIsPlaying(true);
          console.log('Music playing event triggered');
        },
        onpause: () => {
          setIsPlaying(false);
          console.log('Music paused event triggered');
        },
        onstop: () => {
          setIsPlaying(false);
          console.log('Music stopped event triggered');
        },
        onloaderror: (id, err) => {
          console.error('Error loading music:', err);
        },
        onplayerror: (id, err) => {
          console.error('Error playing music:', err);
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
    }
    
    musicRef.current = globalMusic;
    
    // Check localStorage to see if music should be playing
    const musicStatus = localStorage.getItem('backgroundMusicPlaying');
    
    // Try to play music if it should be playing according to localStorage
    if (musicStatus === 'true' && !musicRef.current.playing()) {
      // Use a small timeout to ensure the audio context has time to initialize
      setTimeout(() => {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().then(() => {
            musicRef.current.play();
            console.log('Music auto-resumed from localStorage state');
          }).catch(err => console.error('Failed to resume audio context:', err));
        } else {
          musicRef.current.play();
          console.log('Music auto-played from localStorage state');
        }
      }, 300);
    }

    // No cleanup required as we want music to persist between component unmounts
  }, []);  const playMusic = () => {
    if (musicRef.current) {
      // First ensure AudioContext is running
      const resumeAndPlay = () => {
        if (!musicRef.current.playing()) {
          try {
            musicRef.current.play();
            console.log("Music playing attempt made");
          } catch (e) {
            console.error("Error playing music:", e);
          }
        }
      };

      // For iOS and other platforms that require user interaction
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        console.log("Audio context is suspended, attempting to resume");
        
        // Try to resume the context
        Howler.ctx.resume()
          .then(() => {
            console.log("Audio context resumed successfully");
            resumeAndPlay();
          })
          .catch(err => {
            console.error('Failed to resume audio context:', err);
            // Try to play anyway as a fallback
            resumeAndPlay();
          });
      } else {
        console.log("Audio context is ready, playing directly");
        resumeAndPlay();
      }
      
      // Save music playing status to localStorage
      localStorage.setItem('backgroundMusicPlaying', 'true');
    } else {
      console.error("Music reference is not initialized");
    }
  };

  const pauseMusic = () => {
    if (musicRef.current) {
      if (musicRef.current.playing()) {
        musicRef.current.pause();
        console.log("Music paused");
      }
      // Save music playing status to localStorage
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
    return isPlaying;
  };

  return { playMusic, pauseMusic, setVolume, isMusicPlaying };
};

export default useBackgroundMusic;