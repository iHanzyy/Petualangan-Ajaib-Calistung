import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import '../styles/SplashScreen.css';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';
import { Howler } from 'howler';

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

// Container untuk splash screen
const SplashContainer = styled.div`
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

// Subtitle / Loading text
const Subtitle = styled.div`
  font-size: 1.5rem;
  color: white;
  animation: ${fadeIn} 1.5s ease-out 0.5s both;
`;

// Loading dots animation
const LoadingDots = styled.span`
  &:after {
    content: '.';
    animation: dots 1.5s steps(5, end) infinite;
    
    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60% { content: '...'; }
      80%, 100% { content: ''; }
    }
  }
`;

const SplashScreen = () => {
  const navigate = useNavigate();
  const [showLoadingText, setShowLoadingText] = useState(false);
  const { isMusicPlaying, playMusic } = useBackgroundMusic();
  
  useEffect(() => {
    // Ensure music is playing when entering SplashScreen
    if (localStorage.getItem('backgroundMusicPlaying') === 'true' && !isMusicPlaying()) {
      // Small delay to ensure context is ready
      setTimeout(() => {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().then(() => {
            playMusic();
            console.log('Music continued in SplashScreen after context resume');
          });
        } else {
          playMusic();
          console.log('Music continued in SplashScreen');
        }
      }, 100);
    }
    
    // Show loading text after 1 second
    const loadingTimer = setTimeout(() => {
      setShowLoadingText(true);
    }, 1000);
    
    // Navigate to main menu after splash screen
    const navigationTimer = setTimeout(() => {
      navigate('/menu');
    }, 4500);
    
    // Cleanup timers when component unmounts
    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate, playMusic, isMusicPlaying]);
  
  // Array of characters for the bouncing animation
  const characters = ['📚', '✏️', '🔢'];
  
  return (
    <SplashContainer>
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
      
      {/* Title and loading text */}
      <Title>Petualangan Ajaib Calistung</Title>
      
      {showLoadingText && (
        <Subtitle>
          Memuat petualangan <LoadingDots />
        </Subtitle>
      )}
    </SplashContainer>
  );
};

export default SplashScreen;