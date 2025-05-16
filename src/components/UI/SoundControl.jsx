import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import Howler from 'howler';
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

  useEffect(() => {
    // Check if sound was previously muted
    const savedMuteState = localStorage.getItem('isMuted');
    if (savedMuteState) {
      const muted = JSON.parse(savedMuteState);
      setIsMuted(muted);
      if (Howler.ctx) {
        Howler.volume(muted ? 0 : 1);
      }
      
      // If muted, ensure background music is also paused
      if (muted && isMusicPlaying()) {
        pauseMusic();
      } else if (!muted && localStorage.getItem('backgroundMusicPlaying') === 'true' && !isMusicPlaying()) {
        playMusic();
      }
    }
  }, [pauseMusic, playMusic, isMusicPlaying]);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (Howler.ctx) {
      Howler.volume(newMuteState ? 0 : 1);
    }
    
    // Handle background music
    if (newMuteState) {
      pauseMusic();
    } else if (localStorage.getItem('backgroundMusicPlaying') === 'true') {
      playMusic();
    }
    
    // Save state to localStorage
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