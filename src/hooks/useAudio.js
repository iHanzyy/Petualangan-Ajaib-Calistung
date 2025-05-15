import { useCallback, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler'; // Pastikan Howler juga diimpor

/**
 * Custom hook to handle audio playback using Howler.js
 * 
 * @param {Object} sounds - Object with keys as sound names and values as file paths
 * @returns {Object} - Object containing play function to trigger sounds
 */
const useAudio = (sounds) => {
  const soundsRef = useRef({});
  const playingRef = useRef([]);
  const lastPlayedRef = useRef({}); // Untuk throttling suara yang sama
  
  // Initialize sounds
  useEffect(() => {
    // Unload any existing sounds first to prevent memory issues
    Object.values(soundsRef.current).forEach(sound => {
      if (sound && sound.unload) {
        sound.unload();
      }
    });
    
    // Memastikan Howler tidak memblokir audio di masa depan
    Howler.autoUnlock = true;
    Howler.autoSuspend = false; // Mencegah Howler mensuspend audio context
    
    // Create new sound instances
    Object.entries(sounds).forEach(([name, src]) => {
      soundsRef.current[name] = new Howl({
        src: [src],
        volume: 0.7,
        preload: true,
        html5: true, // Menggunakan HTML5 Audio untuk kompatibilitas lebih baik
        onend: function(id) {
          // Remove from playing array when done
          playingRef.current = playingRef.current.filter(soundId => soundId !== id);
        },
        onloaderror: function(id, err) {
          console.warn(`Error loading sound ${name}:`, err);
          // Coba load ulang untuk recover
          setTimeout(() => {
            this.load();
          }, 500);
        },
        onplayerror: function(id, err) {
          console.warn(`Error playing sound ${name}:`, err);
          // Recover dengan unload dan reload
          const currentSrc = this._src;
          this.unload();
          
          setTimeout(() => {
            soundsRef.current[name] = new Howl({
              src: currentSrc,
              volume: 0.7,
              preload: true,
              html5: true
            });
          }, 100);
        }
      });
    });
    
    // Touch untuk unlock audio di mobile
    document.addEventListener('touchstart', function() {
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        Howler.ctx.resume();
      }
    }, { once: true });
    
    // Cleanup function to release audio resources
    return () => {
      // Stop all playing sounds
      playingRef.current.forEach(id => {
        Howler.stop(id);
      });
      
      // Unload all sounds
      Object.values(soundsRef.current).forEach(sound => {
        if (sound && sound.unload) {
          sound.unload();
        }
      });
      
      // Clear references
      soundsRef.current = {};
      playingRef.current = [];
      lastPlayedRef.current = {};
    };
  }, [sounds]);
  
  // Function to play a specific sound
  const play = useCallback((name) => {
    const sound = soundsRef.current[name];
    if (!sound) return null;

    // Hanya hentikan suara lain jika correct/wrong/gameOver
    if (['correct', 'wrong', 'gameOver'].includes(name)) {
      Object.values(soundsRef.current).forEach(s => {
        if (s !== sound && s.playing()) {
          s.stop();
        }
      });
      sound.volume(0.9);
    }

    // Untuk click, biarkan overlap (tidak stop suara lain)
    if (name === 'click') {
      sound.volume(0.5); // volume lebih kecil agar tidak mengganggu
    }

    try {
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        Howler.ctx.resume();
      }
      const id = sound.play();
      return id;
    } catch (err) {
      return null;
    }
  }, [sounds]);
  
  // Function to stop all sounds
  const stopAll = useCallback(() => {
    Object.values(soundsRef.current).forEach(sound => {
      if (sound && sound.stop) {
        sound.stop();
      }
    });
    playingRef.current = [];
  }, []);
  
  return { play, stopAll };
};

export default useAudio;
