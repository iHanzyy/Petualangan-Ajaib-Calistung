import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Howler from 'howler';
import styled, { keyframes } from 'styled-components';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';

// Animasi untuk karakter melompat
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

// Animasi untuk judul muncul
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-50px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Animasi untuk background bersinar
const glow = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Animasi untuk rotasi karakter
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
`;

// Container untuk initial screen
const InitialContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: ${glow} 15s ease infinite;
  overflow: hidden;
  position: relative;
`;

// Gelembung animasi di background
const Bubble = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: ${props => props.$size || '50px'};
  height: ${props => props.$size || '50px'};
  top: ${props => props.$top || '50%'};
  left: ${props => props.$left || '50%'};
  animation: float ${props => props.$duration || '5s'} ease-in-out infinite;
  
  @keyframes float {
    0% { transform: translate(0, 0); }
    50% { transform: translate(${props => props.$moveX || '20px'}, ${props => props.$moveY || '-20px'}); }
    100% { transform: translate(0, 0); }
  }
`;

// Logo / Karakter utama
const CharacterContainer = styled.div`
  animation: ${bounce} 1.5s ease-in-out infinite;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Character = styled.div`
  font-size: 6rem;
  animation: ${rotate} 3s ease-in-out infinite;
  margin: 0 0.5rem;
`;

// Judul aplikasi
const Title = styled.h1`
  font-size: 3rem;
  color: white;
  text-shadow: 2px 4px 8px rgba(0,0,0,0.3);
  animation: ${fadeIn} 1.5s ease-out;
  text-align: center;
  margin-bottom: 1.5rem;
`;

// Subtitle
const Subtitle = styled.p`
  font-size: 1.5rem;
  color: white;
  text-shadow: 1px 2px 4px rgba(0,0,0,0.3);
  animation: ${fadeIn} 1.5s ease-out 0.5s both;
  text-align: center;
  margin-bottom: 2rem;
`;

// Tombol mulai
const StartButton = styled.button`
  padding: 1.5rem 3rem;
  font-size: 1.8rem;
  background: #FFC107;
  color: #000;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 1.5s ease-out 1s both;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    background: #FFD54F;
  }

  &:active {
    transform: translateY(0) scale(0.95);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const InitialScreen = () => {
  const navigate = useNavigate();
  const { playMusic, isMusicPlaying } = useBackgroundMusic();

  // Add touchstart listener for Howler AudioContext resume
  useEffect(() => {
    const resumeAudio = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
          console.log('AudioContext resumed successfully by user interaction');
          
          // Check if music should be playing
          const musicStatus = localStorage.getItem('backgroundMusicPlaying');
          if (musicStatus === 'true' && !isMusicPlaying()) {
            playMusic();
          }
        });
      }
    };
    
    // Add event listeners for first user interaction
    window.addEventListener('click', resumeAudio, { once: true });
    window.addEventListener('touchstart', resumeAudio, { once: true });
    
    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
  }, [playMusic, isMusicPlaying]);
  const handleStart = () => {
    console.log("Start button clicked, attempting to play music");
    
    // Create an audio context manually if needed for some browsers
    if (!Howler.ctx) {
      console.log("No Howler context, this shouldn't happen but creating a fallback");
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        // Attach it to window to ensure it's not garbage collected
        window._audioCtx = ctx;
      }
    }
    
    // Ensure audio context is running
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      console.log("Audio context suspended, attempting to resume");
      
      // Force user interaction to be registered
      Howler.ctx.resume().then(() => {
        console.log("Audio context resumed successfully");
        // Play music after context is resumed
        playMusic();
        
        // Add a little delay before navigating to ensure audio starts
        setTimeout(() => {
          navigate('/splash');
        }, 300); // Longer delay to ensure audio starts
      }).catch(err => {
        console.error('Failed to resume audio context:', err);
        // Try to play anyway then navigate
        playMusic();
        setTimeout(() => {
          navigate('/splash');
        }, 300);
      });
    } else {
      // Play background music directly
      console.log("Audio context ready, playing music directly");
      playMusic();
      
      // Add a little delay before navigating to ensure audio starts
      setTimeout(() => {
        navigate('/splash');
      }, 200);
    }
  };

  // Array of characters for the bouncing animation
  const characters = ['📚', '✏️', '🔢'];
  
  return (
    <InitialContainer>
      {/* Background bubbles */}
      <Bubble $size="100px" $top="10%" $left="10%" $duration="7s" $moveX="50px" $moveY="30px" />
      <Bubble $size="60px" $top="70%" $left="20%" $duration="9s" $moveX="-30px" $moveY="-50px" />
      <Bubble $size="80px" $top="40%" $left="70%" $duration="8s" $moveX="-50px" $moveY="-20px" />
      <Bubble $size="120px" $top="80%" $left="80%" $duration="10s" $moveX="20px" $moveY="-70px" />
      <Bubble $size="40px" $top="30%" $left="40%" $duration="6s" $moveX="60px" $moveY="40px" />
      
      {/* Main character animation */}
      <CharacterContainer>
        {characters.map((char, index) => (
          <Character 
            key={index} 
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {char}
          </Character>
        ))}
      </CharacterContainer>
      
      {/* Title and subtitle */}
      <Title>Petualangan Ajaib Calistung</Title>
      <Subtitle>Selamat datang di dunia belajar yang menyenangkan!</Subtitle>
      
      {/* Start button */}
      <StartButton onClick={handleStart}>
        Mulai Petualangan
      </StartButton>
    </InitialContainer>
  );
};

export default InitialScreen;