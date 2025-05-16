import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLaptop, 
  faMobile, 
  faArrowRight, 
  faDesktop,
  faStar,
  faGamepad
} from '@fortawesome/free-solid-svg-icons';

// Animasi untuk background
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Animasi untuk gelembung
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

// Animasi untuk judul
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Animasi untuk bintang
const twinkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

// Container utama - menggunakan viewport units untuk responsivitas
const WarningContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(-45deg, #6557ff, #ff9d64, #56baff, #64ffb8);
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow: hidden;
`;

// Gelembung animasi dengan ukuran yang lebih responsif
const Bubble = styled(motion.div)`
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  top: ${props => props.$top || '50%'};
  left: ${props => props.$left || '50%'};
  backdrop-filter: blur(2px);
  box-shadow: inset 0 0 10px rgba(255,255,255,0.5);
  z-index: 1;
  
  @media (max-width: 480px) {
    width: calc(${props => props.$size || '40px'} * 0.7);
    height: calc(${props => props.$size || '40px'} * 0.7);
  }
`;

// Bintang animasi dengan ukuran yang responsif
const Star = styled(motion.div)`
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  font-size: ${props => props.$size || '24px'};
  top: ${props => props.$top || '50%'};
  left: ${props => props.$left || '50%'};
  z-index: 1;
  
  @media (max-width: 480px) {
    font-size: calc(${props => props.$size || '24px'} * 0.7);
  }
`;

// Card untuk konten dengan ukuran yang responsif - MENGHAPUS overflow dan max-height
const ContentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem 1.2rem;
  max-width: 95%;
  width: 90vw;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.2),
    0 5px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  position: relative;
  z-index: 10;
  border: 1px solid rgba(255,255,255,0.5);
  
  // Mengurangi ukuran pada layar kecil
  @media (max-width: 480px) {
    padding: 1.2rem 1rem;
    gap: 0.6rem;
  }
`;

// Judul dengan ukuran font yang responsif
const Title = styled(motion.h2)`
  color: #333;
  font-size: 1.4rem;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  
  @media (min-width: 481px) {
    font-size: 1.6rem;
  }
`;

// Teks dengan ukuran font yang responsif
const Text = styled(motion.p)`
  color: #444;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  
  @media (min-width: 481px) {
    font-size: 1rem;
  }
`;

// Container untuk ilustrasi
const IllustrationContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  padding: 0.3rem 0;
`;

// Icon dengan styling khusus dan ukuran yang responsif
const DeviceIcon = styled(motion.div)`
  font-size: 1.8rem;
  color: ${props => props.$color};
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
  
  @media (min-width: 481px) {
    font-size: 2.2rem;
  }
`;

// Character yang beranimasi
const Character = styled(motion.div)`
  position: absolute;
  font-size: ${props => props.$size || '3rem'};
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 3px 5px rgba(0,0,0,0.2));
  z-index: ${props => props.$zIndex || 5};
  opacity: 0.8;
  
  @media (max-width: 480px) {
    font-size: ${props => props.$sizeMobile || '2.2rem'};
  }
  
  @media (max-width: 360px) {
    display: ${props => props.$hideOnTiny ? 'none' : 'block'};
  }
`;

// Logo container yang lebih compact
const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoWrapper = styled(motion.div)`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff7e5f, #feb47b);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (min-width: 481px) {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }
`;

// Badge berdesain menarik
const Badge = styled(motion.div)`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff3b3b;
  color: white;
  border-radius: 50px;
  padding: 0.3rem 0.7rem;
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(255, 59, 59, 0.4);
  transform: rotate(5deg);
  
  @media (min-width: 481px) {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
`;

// Tombol keren
const FakeButton = styled(motion.button)`
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #6557ff, #bf55ec);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: not-allowed;
  box-shadow: 0 4px 15px rgba(101, 87, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.9;
  
  @media (min-width: 481px) {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
`;

// Cloud animation
const Cloud = styled(motion.div)`
  position: absolute;
  background: rgba(255,255,255,0.85);
  border-radius: 50%;
  width: ${props => props.$width || '80px'};
  height: ${props => props.$height || '40px'};
  top: ${props => props.$top || '20%'};
  left: ${props => props.$left || '10%'};
  filter: blur(${props => props.$blur || '15px'});
  opacity: 0.7;
  z-index: 1;
  
  @media (max-width: 480px) {
    width: calc(${props => props.$width || '80px'} * 0.7);
    height: calc(${props => props.$height || '40px'} * 0.7);
    filter: blur(calc(${props => props.$blur || '15px'} * 0.7));
  }
`;

const MobileWarning = () => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [stars, setStars] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Track window size untuk responsivitas
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Create stars for background
  useEffect(() => {
    const generateStars = () => {
      // Kurangi jumlah bintang pada layar kecil
      const starCount = windowSize.width < 480 ? 5 : 10;
      
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size: `${Math.random() * 15 + 8}px`,
          delay: Math.random() * 2
        });
      }
      setStars(newStars);
    };
    
    generateStars();
  }, [windowSize]);
  
  // Detect touch/mouse movement for interactive rotation
  useEffect(() => {
    const handleMove = (e) => {
      if (!isInteracting) return;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate rotation based on pointer position - lebih rendah pada mobile
      const intensity = windowSize.width < 480 ? 3 : 5;
      const rotateX = ((clientY / windowHeight) - 0.5) * intensity;
      const rotateY = ((clientX / windowWidth) - 0.5) * -intensity;
      
      setRotation({ x: rotateX, y: rotateY });
    };
    
    const handleStart = () => setIsInteracting(true);
    const handleEnd = () => setIsInteracting(false);
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mousedown', handleStart);
    window.addEventListener('touchstart', handleStart);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mousedown', handleStart);
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isInteracting, windowSize.width]);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = '';
  }, []);
  
  return (
    <WarningContainer>
      {/* Clouds - hanya tampilkan 1 cloud pada mobile */}
      <Cloud 
        $width="150px" 
        $height="80px" 
        $top="15%" 
        $left="15%" 
        $blur="15px"
        animate={{
          x: [0, 30, 0],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "easeInOut"
        }}
      />
      
      {windowSize.width > 480 && (
        <Cloud 
          $width="120px" 
          $height="60px" 
          $top="70%" 
          $left="70%" 
          $blur="15px"
          animate={{
            x: [0, -20, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Stars background - lebih sedikit pada mobile */}
      {stars.map((star) => (
        <Star
          key={star.id}
          $top={star.top}
          $left={star.left}
          $size={star.size}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            repeat: Infinity,
            duration: 2 + star.delay,
            ease: "easeInOut"
          }}
        >
          <FontAwesomeIcon icon={faStar} />
        </Star>
      ))}
      
      {/* Bubbles - hanya 2 bubble di mobile */}
      <Bubble 
        $size="80px" 
        $top="15%" 
        $left="15%" 
        animate={{
          y: [-20, 20],
          x: [-5, 5],
          rotate: [0, 5],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
          repeatType: "reverse"
        }}
      />
      
      {windowSize.width > 360 && (
        <Bubble 
          $size="60px" 
          $top="70%" 
          $left="20%" 
          animate={{
            y: [-30, 30],
            x: [5, -5],
            rotate: [3, -3],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
      )}
      
      {/* Animated characters - minimal untuk mobile */}
      <Character
        $size="3.5rem"
        $sizeMobile="2.8rem"
        $zIndex="2"
        animate={{ 
          y: [-10, 10],
          x: [5, -5]
        }}
        transition={{
          repeat: Infinity,
          duration: 7,
          ease: "easeInOut",
          repeatType: "reverse"
        }}
        style={{ bottom: '15%', left: '10%' }}
        drag
        dragConstraints={{
          top: -30, right: 30, bottom: 30, left: -30
        }}
      >
        📚
      </Character>
      
      {windowSize.width > 360 && (
        <Character
          $size="3.2rem"
          $sizeMobile="2.5rem"
          $zIndex="3"
          animate={{ 
            y: [-15, 15],
            x: [8, -8]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
            repeatType: "reverse"
          }}
          style={{ top: '20%', right: '15%' }}
          $hideOnTiny={true}
        >
          🔢
        </Character>
      )}
      
      {/* Card dengan efek 3D saat interaksi */}
      <ContentCard
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          rotateX: rotation.x,
          rotateY: rotation.y
        }}
        transition={{ 
          type: "spring", 
          duration: 0.8,
          rotateX: { type: "spring", stiffness: 100 },
          rotateY: { type: "spring", stiffness: 100 }
        }}
      >
        <Badge
          animate={{
            rotate: [5, -5, 5],
            scale: [1, 1.05, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut"
          }}
        >
          Desktop Only
        </Badge>
        
        <LogoContainer>
          <LogoWrapper>
            <FontAwesomeIcon icon={faGamepad} />
          </LogoWrapper>
          <Title>Petualangan Ajaib Calistung</Title>
        </LogoContainer>
        
        <Title
          animate={{ 
            color: ['#dc3545', '#6557ff', '#dc3545'],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3 
          }}
        >
          Perangkat Tidak Didukung
        </Title>
        
        <IllustrationContainer>
          <DeviceIcon 
            $color="#dc3545"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [-3, 3, -3]
            }}
            transition={{
              repeat: Infinity,
              duration: 2
            }}
          >
            <FontAwesomeIcon icon={faMobile} />
          </DeviceIcon>
          
          <motion.div
            animate={{ 
              x: [0, 3, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5
            }}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </motion.div>
          
          <DeviceIcon 
            $color="#28a745"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [3, -3, 3]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: 1
            }}
          >
            <FontAwesomeIcon icon={faDesktop} />
          </DeviceIcon>
        </IllustrationContainer>
        
        <Text>
          Fitur menulis huruf dan permainan interaktif hanya dapat digunakan pada laptop atau komputer.
        </Text>
        
        <FakeButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: ['0 4px 8px rgba(101,87,255,0.3)', '0 6px 12px rgba(101,87,255,0.5)', '0 4px 8px rgba(101,87,255,0.3)']
          }}
          transition={{
            repeat: Infinity,
            duration: 2
          }}
        >
          <FontAwesomeIcon icon={faLaptop} />
          Buka di Desktop/Laptop
        </FakeButton>
      </ContentCard>
    </WarningContainer>
  );
};

export default MobileWarning;