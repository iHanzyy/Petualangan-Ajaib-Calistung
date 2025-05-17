/**
 * Utility functions to help with audio functionality
 */

import { Howler } from 'howler';

/**
 * Ensures that the AudioContext is running
 * @returns {Promise} A promise that resolves when AudioContext is resumed
 */
export const ensureAudioContext = () => {
  if (!Howler.ctx) {
    console.warn('[AudioHelper] Howler.ctx belum tersedia');
    return Promise.resolve(false);
  }
  
  if (Howler.ctx.state === 'suspended') {
    console.log('[AudioHelper] Mencoba resume AudioContext dari status suspended');
    return Howler.ctx.resume().then(() => {
      console.log('[AudioHelper] AudioContext berhasil diresume');
      return true;
    }).catch(err => {
      console.error('[AudioHelper] Gagal meresume AudioContext:', err);
      return false;
    });
  }
  
  return Promise.resolve(true);
};

/**
 * Fungsi untuk cek status audio
 * @returns {Object} - Object dengan informasi status audio
 */
export const getAudioStatus = () => {
  return {
    contextExists: !!Howler.ctx,
    contextState: Howler.ctx ? Howler.ctx.state : 'tidak ada',
    muted: Howler.muted,
    volume: Howler.volume(),
    usingWebAudio: Howler.usingWebAudio,
    noAudio: Howler.noAudio,
    mobileAutoEnable: Howler.mobileAutoEnable,
    autoUnlock: Howler.autoUnlock
  };
};

/**
 * Safely plays a sound with a Howl instance
 * @param {Howl} sound - The Howl instance to play 
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {number|null} The sound ID if successful, or null
 */
export const safePlaySound = (sound, volume = 0.8) => {
  if (!sound) return null;
  
  try {
    ensureAudioContext();
    
    sound.volume(volume);
    const id = sound.play();
    
    // Check if the sound is actually playing
    if (typeof id !== 'undefined' && sound.playing(id)) {
      return id;
    } else {
      throw new Error('Sound not playing after .play() call');
    }
  } catch (err) {
    console.error('[AudioHelper] Error playing sound:', err);
    return null;
  }
};

/**
 * Fungsi untuk memainkan suara notifikasi untuk debugging
 * @param {string} type - Jenis suara ('correct', 'wrong', 'click')
 */
export const playDebugSound = (type = 'click') => {
  ensureAudioContext().then(() => {
    try {
      const sound = new Howl({
        src: [`/sounds/${type}.mp3`],
        volume: 1.0,
        html5: false
      });
      
      sound.on('load', () => {
        console.log(`[AudioHelper] Sound ${type} loaded, playing...`);
        sound.play();
      });
      
      sound.on('loaderror', (id, err) => {
        console.error(`[AudioHelper] Error loading sound ${type}:`, err);
      });
      
      sound.on('playerror', (id, err) => {
        console.error(`[AudioHelper] Error playing sound ${type}:`, err);
      });
    } catch (e) {
      console.error(`[AudioHelper] Exception creating sound ${type}:`, e);
    }
  });
};