import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { Howler } from 'howler';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';

const SoundButton = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  opacity: 0.7;
  transition: all 0.3s ease;
  z-index: 100;
  cursor: pointer;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SoundControl = () => {
  const [isMuted, setIsMuted] = useState(false);
  const { playMusic, pauseMusic, isMusicPlaying } = useBackgroundMusic();
  const wasMusicPlayingRef = useRef(false);
  
  // Check initial mute state on component mount
  useEffect(() => {
    // Load mute state from localStorage
    const savedMuteState = localStorage.getItem('isMuted');
    const muted = savedMuteState ? JSON.parse(savedMuteState) : false;
    
    setIsMuted(muted);
    
    // Apply mute state directly to Howler
    if (muted) {
      Howler.volume(0);
      
      // Save current music status for later
      wasMusicPlayingRef.current = localStorage.getItem('backgroundMusicPlaying') === 'true';
      
      // If music should be playing but we're muted, update localStorage
      if (wasMusicPlayingRef.current) {
        localStorage.setItem('backgroundMusicWasPlaying', 'true');
      }
    } else {
      Howler.volume(1);
      
      // Check if music should be playing but explicitly avoid playing it again here
      // This prevents audio doubling when SoundControl mounts
    }
  }, []);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    
    // Update UI state
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      // MUTE: Save current state and mute
      
      // Check if music is currently playing before muting
      const musicIsCurrentlyPlaying = isMusicPlaying();
      wasMusicPlayingRef.current = musicIsCurrentlyPlaying;
      
      // Store the fact that music was playing
      if (musicIsCurrentlyPlaying) {
        localStorage.setItem('backgroundMusicWasPlaying', 'true');
      }
      
      // Mute the sound (but don't pause the music)
      Howler.volume(0);
      console.log("Sound is now muted, music state:", musicIsCurrentlyPlaying);
    } else {
      // UNMUTE: Restore previous state
      
      // Restore volume
      Howler.volume(1);
      
      // Check if music was playing before mute
      const musicWasPlaying = wasMusicPlayingRef.current || 
                             localStorage.getItem('backgroundMusicWasPlaying') === 'true';
      
      if (musicWasPlaying) {
        // Clear the flag
        localStorage.removeItem('backgroundMusicWasPlaying');
        
        // If music should be playing but isn't, start it
        if (!isMusicPlaying()) {
          console.log("Resuming music after unmute");
          setTimeout(() => {
            playMusic();
          }, 100);
        }
      }
      console.log("Sound is now unmuted, restoring music:", musicWasPlaying);
    }
    
    // Save mute state to localStorage
    localStorage.setItem('isMuted', JSON.stringify(newMuteState));
  };

  return (
    <SoundButton
      onClick={toggleMute}
      aria-label={isMuted ? "Aktifkan suara" : "Matikan suara"}
      title={isMuted ? "Aktifkan suara" : "Matikan suara"}
    >
      <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeHigh} />
    </SoundButton>
  );
};

export default SoundControl;