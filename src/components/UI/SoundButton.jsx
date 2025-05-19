import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Howler } from 'howler';
import useAudio from '../../hooks/useAudio';

const StyledButton = styled.button`
  ${props => props.styles}
`;

/**
 * SoundButton component - A button wrapper that adds click sound functionality
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Original onClick handler
 * @param {Object} props.styles - Additional styles to apply
 * @param {React.ReactNode} props.children - Button content
 * @returns {JSX.Element} - Rendered component
 */
const SoundButton = ({ onClick, styles, children, ...props }) => {
  const { play, isAudioReady, isLoading } = useAudio({
    click: '/sounds/click-button.mp3'
  });
  
  const audioRef = useRef(null);
  
  // Initialize audio on mount
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (Howler.ctx && Howler.ctx.state !== 'running') {
          await Howler.ctx.resume();
          console.log('Audio context resumed in SoundButton');
        }
        
        // Test direct audio playback
        if (!audioRef.current) {
          audioRef.current = new Audio('/sounds/click-button.mp3');
          audioRef.current.volume = 0.8;
          console.log('Direct audio test initialized');
        }
      } catch (error) {
        console.error('Error initializing audio in SoundButton:', error);
      }
    };
    
    initAudio();
  }, []);
  
  const handleClick = (e) => {
    // Try both Howler and direct audio
    if (isAudioReady && !isLoading) {
      console.log('Playing click sound via Howler');
      play('click');
    } else if (audioRef.current) {
      console.log('Playing click sound via direct Audio API');
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error('Error playing direct audio:', err);
      });
    } else {
      console.log('Audio not ready or still loading');
    }
    
    // Then call original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <StyledButton 
      onClick={handleClick}
      styles={styles}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default SoundButton; 