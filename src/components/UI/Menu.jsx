import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPencilAlt, faCalculator, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import SoundControl from './SoundControl';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';
import { Howler } from 'howler';
import { motion } from 'framer-motion';
import FloatingElements from './FloatingElements'; // Tambahkan impor ini

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

// Animasi untuk sparkles
const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
`;

// Styled components for UI
const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  background-image: url('images/background-menu.png'); 
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0);
    z-index: 0;
  }
`;

const Title = styled.h1`
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

const Subtitle = styled.h2`
  font-family: 'Cal Sans', sans-serif;
  font-size: 1.8rem;
  color: var(--primary-dark-color);
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3),
               0 0 10px rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  backdrop-filter: blur(2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
`;

// Perbaikan: Gunakan styled(motion.a) alih-alih motion(Link) untuk menghindari masalah kompatibilitas
const MenuButton = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.2rem 2rem;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border-radius: 1rem;
  font-size: 1.5rem;
  width: 100%;
  max-width: 350px;
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  &:hover {
    text-decoration: none;
  }
`;

const IconWrapper = styled.span`
  font-size: 1.5rem;
`;

const AnimatedLetter = styled.span`
  display: inline-block;
  animation: ${bounce} 1s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
`;

/**
 * Main Menu component for game mode selection
 */
const Menu = () => {
  // Using title constant for the animated text
  const title = "PETUALANGAN AJAIB CALISTUNG";
  const { playMusic, isMusicPlaying } = useBackgroundMusic();
  
  // Ensure music is still playing when menu loads
  useEffect(() => {
    console.log("Menu component mounted");
    const checkAndPlayMusic = () => {
      if (!isMusicPlaying()) {
        console.log("Menu detected music not playing, playing it now");
        
        // Prevent multiple simultaneous attempts
        setTimeout(() => {
          if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
              if (!isMusicPlaying()) { // Check again after resume
                playMusic();
              }
            });
          } else {
            if (!isMusicPlaying()) { // Double check current state
              playMusic();
            }
          }
        }, 200);
      } else {
        console.log("Menu detected music already playing");
      }
    };

    // Only play if it should be playing according to localStorage
    const shouldBePlaying = localStorage.getItem('backgroundMusicPlaying') === 'true';
    const isMuted = localStorage.getItem('isMuted') === 'true';
    
    if (shouldBePlaying && !isMuted) {
      // Add a small delay to avoid race conditions
      setTimeout(checkAndPlayMusic, 300);
    }
    
    return () => {
      console.log("Menu component unmounting");
      // No need to pause music when leaving menu
    };
  }, [playMusic, isMusicPlaying]);
  
  return (
    <MenuContainer>
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Subtitle>Mari Belajar Membaca, Menulis, dan Berhitung!</Subtitle>
      </motion.div>
      
      <ButtonsContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          custom={0}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link to="/reading" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <MenuButton 
              color="var(--primary-color)" 
              aria-label="Mode Membaca"
              whileHover={{ 
                y: -5, 
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" 
              }}
              whileTap={{ y: 0, scale: 0.95 }}
            >
              <IconWrapper><FontAwesomeIcon icon={faBook} /></IconWrapper>
              Mode Membaca
            </MenuButton>
          </Link>
        </motion.div>
        
        <motion.div
          custom={1}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link to="/writing" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <MenuButton 
              color="var(--success-color)"
              aria-label="Mode Menulis"
              whileHover={{ 
                y: -5, 
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" 
              }}
              whileTap={{ y: 0, scale: 0.95 }}
            >
              <IconWrapper><FontAwesomeIcon icon={faPencilAlt} /></IconWrapper>
              Mode Menulis
            </MenuButton>
          </Link>
        </motion.div>
        
        <motion.div
          custom={2}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/counting" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <MenuButton 
              color="var(--primary-dark-color)" 
              aria-label="Mode Berhitung"
              whileHover={{ 
                y: -5, 
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" 
              }}
              whileTap={{ y: 0, scale: 0.95 }}
            >
              <IconWrapper><FontAwesomeIcon icon={faCalculator} /></IconWrapper>
              Mode Berhitung
            </MenuButton>
          </Link>
        </motion.div>
        
        <motion.div
          custom={3}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link to="/about" style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
            <MenuButton 
              color="var(--info-color)" 
              aria-label="Tentang Permainan"
              whileHover={{ 
                y: -5, 
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" 
              }}
              whileTap={{ y: 0, scale: 0.95 }}
            >
              <IconWrapper><FontAwesomeIcon icon={faInfoCircle} /></IconWrapper>
              Tentang Permainan
            </MenuButton>
          </Link>
        </motion.div>
      </ButtonsContainer>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <SoundControl />
      </motion.div>
    </MenuContainer>
  );
};

export default Menu;
