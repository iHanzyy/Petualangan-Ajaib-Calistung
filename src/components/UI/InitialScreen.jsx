import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Howler from 'howler';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
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
const StartButton = styled(motion.button)`
  padding: 1.5rem 3rem;
  font-size: 1.8rem;
  background: #FFC107;
  color: #000;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const InitialScreen = () => {
  const navigate = useNavigate();
  const { playMusic, isMusicPlaying } = useBackgroundMusic();
  const [isNavigating, setIsNavigating] = useState(false);

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
  
  // Perbarui fungsi handleStart untuk menghindari multiple play
  const handleStart = () => {
    // Prevent multiple clicks
    if (isNavigating) {
      console.log("Navigation already in progress, ignoring click");
      return;
    }
    
    setIsNavigating(true);
    console.log("Start button clicked, attempting to play music");
    
    // Play music only if it's not already playing
    const musicIsPlaying = isMusicPlaying();
    if (!musicIsPlaying) {
      console.log("Music not playing, starting it now");
      
      // Ensure audio context is running
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        console.log("Audio context suspended, attempting to resume");
        
        Howler.ctx.resume().then(() => {
          console.log("Audio context resumed successfully");
          playMusic();
          
          // Navigate after ensuring audio is playing
          setTimeout(() => {
            navigate('/splash');
          }, 300);
        }).catch(err => {
          console.error('Failed to resume audio context:', err);
          playMusic(); // Try anyway
          
          setTimeout(() => {
            navigate('/splash');
          }, 300);
        });
      } else {
        // Play directly if context is ready
        console.log("Audio context ready, playing music directly");
        playMusic();
        
        setTimeout(() => {
          navigate('/splash');
        }, 200);
      }
    } else {
      console.log("Music is already playing, just navigating");
      setTimeout(() => {
        navigate('/splash');
      }, 100);
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
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <Title>Petualangan Ajaib Calistung</Title>
        <Subtitle>Selamat datang di dunia belajar yang menyenangkan!</Subtitle>
      </motion.div>
      
      <StartButton 
        onClick={handleStart}
        whileHover={{ 
          scale: 1.05, 
          y: -5,
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)"
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 10 }}
      >
        Mulai Petualangan
      </StartButton>
    </InitialContainer>
  );
};

export default InitialScreen;