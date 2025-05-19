import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Howler from 'howler';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';
import SoundButton from './SoundButton';

// Animasi untuk karakter melompat dan sedikit rotasi - NOT USED NOW, MOVED TO FRAMER-MOTION
/*
const bounce = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(-3deg); }
  75% { transform: translateY(-15px) rotate(3deg); }
`;
*/

// Animasi untuk judul muncul - TIDAK DIGUNAKAN LAGI
/*
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-50px); }
  to { opacity: 1; transform: translateY(0); }
`;
*/

// Animasi untuk rotasi karakter - TIDAK DIGUNAKAN LAGI
/*
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
`;
*/

// Animasi untuk sparkles
const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.5); } 
  50% { opacity: 1; transform: scale(1.2); } 
`;

// Animasi untuk judul
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const rainbow = keyframes`
  0% { color: #FF5757; }
  25% { color: #FFC857; }
  50% { color: #70C1B3; }
  75% { color: #6B76FF; }
  100% { color: #FF5757; }
`;

// Container untuk initial screen
const InitialContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background-image: url('/images/initialScreen.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  position: relative;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.25); /* Slightly less dark overlay */
    z-index: -1;
  }
`;

// Gelembung animasi di background
const Bubble = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.3); /* Slightly more visible bubbles */
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5); /* Add slight glow */
  width: ${props => props.$size || '50px'};
  height: ${props => props.$size || '50px'};
  top: ${props => props.$top || '50%'};
  left: ${props => props.$left || '50%'};
  animation: float ${props => props.$duration || '5s'} ease-in-out infinite;
  z-index: -1;
  
  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(${props => props.$moveX || '20px'}, ${props => props.$moveY || '-20px'}) scale(1.05); }
    100% { transform: translate(0, 0) scale(1); }
  }
`;

// Logo / Karakter utama
const CharacterContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

// Karakter animasi individu dengan interaksi
const Character = styled(motion.div)`
  font-size: 6rem;
  margin: 0 0.5rem;
  cursor: pointer; /* Indicate interactivity */
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3); /* Add shadow for depth */
  /* Initial and animate states handled by framer-motion */
`;

// Judul aplikasi
const Title = styled(motion.h1)`
  font-family: 'Cal Sans', sans-serif;
  font-size: 4rem;
  color: var(--primary-color);
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4), 
               0 0 5px rgba(255, 255, 255, 0.8),
               0 0 15px rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-bottom: 0;
  position: relative;
  z-index: 1;
  animation: ${rainbow} 8s infinite, ${bounce} 2s ease-in-out infinite;
  letter-spacing: 2px;
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.2);
  
  &::before, &::after {
    content: "✨";
    position: absolute;
    font-size: 2rem;
    animation: ${sparkle} 1.5s infinite;
  }
  
  &::before {
    left: -2rem;
    top: -0.5rem;
    animation-delay: 0.2s;
  }
  
  &::after {
    right: -2rem;
    top: -0.5rem;
    animation-delay: 0.7s;
  }
`;

// Subtitle
const Subtitle = styled(motion.h2)`
  font-family: 'Cal Sans', sans-serif;
  font-size: 1.8rem;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5),
               0 0 10px rgba(0, 0, 0, 0.3),
               0 0 20px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.8rem 2rem;
  border-radius: 30px;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2),
              inset 0 0 10px rgba(255, 255, 255, 0.1);
`;

// Tombol mulai
const StartButton = styled(SoundButton)`
  padding: 1.5rem 3rem;
  font-size: 1.8rem;
  font-family: 'Cal Sans', sans-serif;
  background: linear-gradient(135deg, #FFC107 0%, #FF9800 100%);
  color: #000;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: 
    box-shadow 0.25s cubic-bezier(.4,2,.6,1),
    transform 0.18s cubic-bezier(.4,2,.6,1);

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(120deg, #fffbe7 0%, #ffe082 100%);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 0;
    border-radius: 50px;
  }

  &:hover::before {
    opacity: 0.18;
  }

  &:active {
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  }
`;

// Add AnimatedLetter component after other styled components
const AnimatedLetter = styled.span`
  display: inline-block;
  animation: ${bounce} 1s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
`;

const InitialScreen = () => {
  const navigate = useNavigate();
  const { playMusic, isMusicPlaying } = useBackgroundMusic();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Add title constant for the animated text
  const title = "PETUALANGAN AJAIB CALISTUNG";

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
          
          // Navigate immediately to splash screen
          navigate('/splash');
        }).catch(err => {
          console.error('Failed to resume audio context:', err);
          playMusic(); // Try anyway
          
          // Navigate immediately to splash screen
          navigate('/splash');
        });
      } else {
        // Play directly if context is ready
        console.log("Audio context ready, playing music directly");
        playMusic();
        
        // Navigate immediately to splash screen
        navigate('/splash');
      }
    } else {
      console.log("Music is already playing, just navigating");
      // Navigate immediately to splash screen
      navigate('/splash');
    }
  };

  // Array of characters for the bouncing animation
  const characters = ['📚', '✏️', '🔢'];
  
  return (
    <InitialContainer
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
    >
      {/* Background bubbles - More variety */}
      <Bubble $size="120px" $top="5%" $left="15%" $duration="8s" $moveX="40px" $moveY="25px" />
      <Bubble $size="70px" $top="15%" $left="85%" $duration="9s" $moveX="-35px" $moveY="-45px" />
      <Bubble $size="90px" $top="50%" $left="10%" $duration="7s" $moveX="-25px" $moveY="-30px" />
      <Bubble $size="150px" $top="75%" $left="80%" $duration="10s" $moveX="15px" $moveY="-60px" />
      <Bubble $size="60px" $top="30%" $left="45%" $duration="6s" $moveX="50px" $moveY="35px" />
      <Bubble $size="100px" $top="85%" $left="25%" $duration="8.5s" $moveX="-40px" $moveY="50px" />
      <Bubble $size="80px" $top="20%" $left="60%" $duration="7.5s" $moveX="30px" $moveY="-30px" />
      
      {/* Main character animation with hover effects */}
      <CharacterContainer>
        {characters.map((char, index) => (
          <Character 
            key={index} 
            animate={{
              y: [0, -15, 0],
              rotate: [0, (index % 2 === 0 ? -3 : 3), 0]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              delay: index * 0.2,
              repeatType: "loop"
            }}
            whileHover={{ scale: 1.2, rotate: 0 }}
            whileTap={{ scale: 0.9, y: 0 }}
          >
            {char}
          </Character>
        ))}
      </CharacterContainer>
      
      {/* Title and subtitle with new styling */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <Title>
          {title.split('').map((letter, index) => (
            <AnimatedLetter 
              key={index} 
              $delay={`${index * 0.09}s`}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </AnimatedLetter>
          ))}
        </Title>
        <Subtitle>
          Selamat datang di dunia belajar yang menyenangkan!
        </Subtitle>
      </motion.div>
      
      <StartButton
        onClick={handleStart}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 18, delay: 0.5 } }}
        exit={{ opacity: 0, y: 20, transition: { duration: 0.3, ease: "easeInOut", delay: 0.1 } }}
        whileHover={{
          scale: 1.07,
          y: -6,
          boxShadow: "0 8px 25px rgba(0,0,0,0.28)",
          transition: { type: "spring", stiffness: 400, damping: 12 }
        }}
        whileTap={{
          scale: 0.96,
          y: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }}
      >
        Mulai Petualangan
      </StartButton>
    </InitialContainer>
  );
};

export default InitialScreen;