import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import '../styles/SplashScreen.css';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';
import { Howler } from 'howler';

// Container untuk splash screen
const SplashContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
`;

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isMusicPlaying, playMusic } = useBackgroundMusic();
  
  // Automatically play music if it should be playing and isn't
  useEffect(() => {
    const shouldBePlaying = localStorage.getItem('backgroundMusicPlaying') === 'true';
    const isMuted = localStorage.getItem('isMuted') === 'true';
    
    if (shouldBePlaying && !isMuted && !isMusicPlaying()) {
        // Small delay to ensure context is ready
        setTimeout(() => {
          if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
              if (!isMusicPlaying()) { // Check again after resume
                playMusic();
                console.log('Music continued in SplashScreen after context resume');
              }
            });
          } else {
            if (!isMusicPlaying()) { // Double check current state
              playMusic();
              console.log('Music continued in SplashScreen');
            }
          }
        }, 100);
      }
  }, [playMusic, isMusicPlaying]);
  
  // Navigate to main menu when the video ends
  const handleVideoEnd = () => {
    navigate('/menu');
  };

  // Cleanup function for useEffect (no timers to clear anymore)
  useEffect(() => {
    return () => {
      // No cleanup needed here since navigation is on video end
    };
  }, []); // Empty dependency array means this runs once on mount/unmount

  return (
    <SplashContainer>
      {/* Background Video */}
      <BackgroundVideo 
        src="/video/splashscreen.mp4" 
        autoPlay 
        loop={false} // Ensure video does not loop
        muted // Start muted, user can unmute via system or a control if added
        playsInline // Recommended for mobile Safari
        onEnded={handleVideoEnd} // Trigger navigation on video end
      />
    </SplashContainer>
  );
};

export default SplashScreen;