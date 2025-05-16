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
  const actionInProgressRef = useRef(false); // Prevent rapid clicks
  
  // Check initial mute state on component mount
  useEffect(() => {
    console.log("SoundControl mounted");
    // Load mute state from localStorage
    const savedMuteState = localStorage.getItem('isMuted');
    const muted = savedMuteState ? JSON.parse(savedMuteState) : false;
    
    setIsMuted(muted);
    
    // Apply mute state directly to Howler
    if (muted) {
      console.log("Initializing SoundControl as muted");
      Howler.volume(0);
      
      // Save current music status for later without triggering new actions
      wasMusicPlayingRef.current = localStorage.getItem('backgroundMusicPlaying') === 'true';
      
      if (wasMusicPlayingRef.current) {
        localStorage.setItem('backgroundMusicWasPlaying', 'true');
      }
    } else {
      console.log("Initializing SoundControl as unmuted");
      Howler.volume(1);
    }
    
    return () => {
      console.log("SoundControl unmounted");
    };
  }, []);

  const toggleMute = () => {
    // Prevent multiple rapid clicks
    if (actionInProgressRef.current) {
      console.log("Action in progress, ignoring click");
      return;
    }
    
    actionInProgressRef.current = true;
    setTimeout(() => {
      actionInProgressRef.current = false;
    }, 300);
    
    const newMuteState = !isMuted;
    console.log("Toggling mute state to:", newMuteState);
    
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
      
      // Mute the sound (don't pause the music, just set volume to 0)
      Howler.volume(0);
      console.log("Sound is now muted, music state preserved:", musicIsCurrentlyPlaying);
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
          }, 200); // Add small delay for stability
        }
      }
      console.log("Sound is now unmuted, music state restored:", musicWasPlaying);
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