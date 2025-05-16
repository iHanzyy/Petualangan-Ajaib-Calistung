import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faMobile, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';

// Animasi untuk background
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Animasi untuk gelembung
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

// Container utama
const WarningContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #ff7e5f, #feb47b, #7fc8f8, #7dcfb6);
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  overflow: hidden;
`;

// Gelembung animasi
const Bubble = styled(motion.div)`
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: ${props => props.$size || '50px'};
  height: ${props => props.$size || '50px'};
  top: ${props => props.$top || '50%'};
  left: ${props => props.$left || '50%'};
`;

// Card untuk konten
const ContentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  max-width: 90%;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 10;
`;

// Judul
const Title = styled(motion.h2)`
  color: var(--primary-dark-color);
  font-size: 2rem;
  margin: 0;
`;

// Teks
const Text = styled(motion.p)`
  color: var(--dark-color);
  font-size: 1.2rem;
  line-height: 1.5;
`;

// Container untuk ilustrasi
const IllustrationContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin: 1rem 0;
`;

// Icon dengan styling khusus
const DeviceIcon = styled(motion.div)`
  font-size: 3rem;
  color: ${props => props.$color};
`;

// Tombol
const Button = styled(motion.button)`
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-size: 1.2rem;
  border: none;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Character yang beranimasi
const Character = styled(motion.div)`
  position: absolute;
  font-size: 4rem;
  user-select: none;
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--primary-dark-color);
  font-size: 1.5rem;
  cursor: pointer;
`;

const MobileWarning = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <WarningContainer>
      {/* Latar belakang dengan gelembung */}
      <Bubble 
        $size="100px" 
        $top="10%" 
        $left="10%" 
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut"
        }}
      />
      <Bubble 
        $size="70px" 
        $top="70%" 
        $left="20%" 
        animate={{
          y: [0, -40, 0],
          x: [0, -20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 7,
          ease: "easeInOut"
        }}
      />
      <Bubble 
        $size="120px" 
        $top="30%" 
        $left="80%" 
        animate={{
          y: [0, -50, 0],
          x: [0, -30, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 9,
          ease: "easeInOut"
        }}
      />
      
      {/* Karakter yang bergerak */}
      <Character
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          y: [0, -20, 0]
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut"
          },
          delay: 0.5
        }}
        style={{ bottom: '15%', left: '10%' }}
      >
        📚
      </Character>
      
      <Character
        initial={{ x: 100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          y: [0, -30, 0]
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          },
          delay: 0.8
        }}
        style={{ top: '20%', right: '15%' }}
      >
        ✏️
      </Character>
      
      <Character
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          rotate: {
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          },
          delay: 1
        }}
        style={{ bottom: '25%', right: '18%' }}
      >
        🔢
      </Character>
      
      {/* Card konten */}
      <ContentCard
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <CloseButton 
          onClick={() => document.getElementById('mobile-warning').style.display = 'none'}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Tutup peringatan"
        >
          <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        
        <Title
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Oops! Layar Terlalu Kecil
        </Title>
        
        <IllustrationContainer>
          <DeviceIcon 
            $color="var(--danger-color)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.4,
              type: "spring",
              stiffness: 300
            }}
          >
            <FontAwesomeIcon icon={faMobile} />
          </DeviceIcon>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </motion.div>
          
          <DeviceIcon 
            $color="var(--success-color)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.8,
              type: "spring",
              stiffness: 300
            }}
          >
            <FontAwesomeIcon icon={faLaptop} />
          </DeviceIcon>
        </IllustrationContainer>
        
        <Text
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Aplikasi Petualangan Ajaib Calistung dirancang untuk pengalaman terbaik di laptop atau komputer.
        </Text>
        
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: showDetails ? 'auto' : 0,
            opacity: showDetails ? 1 : 0
          }}
          style={{ overflow: 'hidden' }}
        >
          <Text>
            Beberapa fitur seperti menulis huruf, mendengarkan suara, dan aktivitas drag-and-drop memerlukan layar yang lebih besar untuk pengalaman optimal.
          </Text>
        </motion.div>
        
        <Button 
          onClick={() => setShowDetails(!showDetails)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showDetails ? 'Sembunyikan Detail' : 'Lihat Detail'}
        </Button>
      </ContentCard>
    </WarningContainer>
  );
};

export default MobileWarning;