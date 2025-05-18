import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBook, 
  faPencilAlt, 
  faCalculator, 
  faInfoCircle, 
  faHeart, 
  faChild
} from '@fortawesome/free-solid-svg-icons';

// Animasi latar belakang berwarna-warni
const gradientAnimation = keyframes`
  0% { background-position: 0% 50% }
  25% { background-position: 50% 25% }
  50% { background-position: 100% 50% }
  75% { background-position: 50% 75% }
  100% { background-position: 0% 50% }
`;

// Animasi untuk gelembung
const float = keyframes`
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0); }
`;

// Container dengan latar belakang menarik
const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(-45deg, #FF6B6B, #4ECDC4, #45B7D1, #96E6B3, #FFD93D);
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 100%);
    pointer-events: none;
  }
`;

// Gelembung animasi
const Bubble = styled(motion.div)`
  position: absolute;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(255,255,255,0.8);
  backdrop-filter: blur(5px);
  z-index: 1;
  pointer-events: none;
  animation: ${float} 6s ease-in-out infinite;
`;

// Karakter animasi
const AnimatedCharacter = styled(motion.div)`
  position: absolute;
  font-size: 2.5rem;
  color: ${props => props.color || '#ff7e5f'};
  filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.2));
  z-index: 5;
`;

const AboutContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 2;
  overflow: hidden;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionContainer = styled(motion.div)`
  margin-bottom: 2rem;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconWrapper = styled(motion.span)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.bg || 'var(--primary-light-color)'};
  color: white;
`;

// Lista dengan animasi
const GameModeList = styled.ul`
  list-style-type: none;
  padding-left: 1rem;
`;

const GameModeItem = styled(motion.li)`
  margin-bottom: 1.2rem;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.5);
  border-left: 4px solid var(--primary-color);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  strong {
    color: var(--primary-color);
    font-size: 1.1rem;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
`;

const HomeButton = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 0.85rem 1.8rem;
  background: linear-gradient(135deg, var(--primary-color), #4e9eff);
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #0069d9, var(--primary-color));
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
  }
`;

/**
 * About page component showing information about the game
 * with interactive animations for children
 * 
 * @returns {JSX.Element} - Rendered component
 */
const About = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <PageContainer>
      {/* Animasi gelembung latar belakang */}
      <Bubble 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 0.6,
          y: [0, -30, 0],
          x: [0, 15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ repeat: Infinity, duration: 8 }}
        style={{ width: '150px', height: '150px', top: '15%', left: '10%' }}
      />
      <Bubble 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 0.5,
          y: [0, 25, 0],
          x: [0, -20, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ repeat: Infinity, duration: 10, delay: 1 }}
        style={{ width: '100px', height: '100px', top: '70%', left: '15%' }}
      />
      <Bubble 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 0.4,
          y: [0, -20, 0],
          x: [0, -15, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ repeat: Infinity, duration: 7, delay: 2 }}
        style={{ width: '180px', height: '180px', top: '60%', left: '80%' }}
      />
      <Bubble 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 0.3,
          y: [0, 15, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ repeat: Infinity, duration: 9, delay: 1.5 }}
        style={{ width: '120px', height: '120px', top: '30%', left: '85%' }}
      />
      <Bubble 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 0.4,
          y: [0, -25, 0],
          x: [0, -10, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ repeat: Infinity, duration: 11, delay: 0.5 }}
        style={{ width: '90px', height: '90px', top: '80%', left: '70%' }}
      />
      
      {/* Karakter animasi */}
      <AnimatedCharacter 
        color="#FF5757"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ repeat: Infinity, duration: 3 }}
        style={{ top: '10%', right: '15%' }}
      >
        📚
      </AnimatedCharacter>
      <AnimatedCharacter 
        color="#70C1B3"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, -8, 0]
        }}
        transition={{ repeat: Infinity, duration: 4, delay: 1.5 }}
        style={{ bottom: '15%', left: '10%' }}
      >
        ✏️
      </AnimatedCharacter>
      <AnimatedCharacter 
        color="#FFC857"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ repeat: Infinity, duration: 2.5, delay: 0.8 }}
        style={{ bottom: '25%', right: '10%' }}
      >
        🔢
      </AnimatedCharacter>

      <AboutContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          Tentang Petualangan Ajaib Calistung
        </Title>
        
        <SectionContainer
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <SectionTitle>
            <IconWrapper 
              bg="#6B76FF"
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </IconWrapper>
            Apa itu Calistung?
          </SectionTitle>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Calistung adalah singkatan dari Membaca, Menulis, dan Berhitung. 
            Aplikasi permainan ini dirancang untuk membantu anak-anak berkebutuhan khusus 
            belajar keterampilan dasar melalui cara yang menyenangkan dan interaktif.
          </motion.p>
        </SectionContainer>
        
        <SectionContainer
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <SectionTitle>
            <IconWrapper 
              bg="#FF5757"
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faChild} />
            </IconWrapper>
            Cara Bermain
          </SectionTitle>
          <GameModeList>
            {[
              {
                icon: faBook, 
                title: "Mode Membaca", 
                desc: "Dengarkan kata yang diucapkan, lalu ucapkan kembali kata tersebut melalui mikrofon. Anda akan mendapat umpan balik tentang pengucapan Anda.",
                color: "var(--primary-color)"
              },
              { 
                icon: faPencilAlt, 
                title: "Mode Menulis", 
                desc: "Lihat huruf atau angka yang ditampilkan, lalu tuliskan dengan menggunakan mouse pada papan gambar. Sistem akan menilai kecocokan tulisan Anda.",
                color: "var(--success-color)"
              },
              { 
                icon: faCalculator, 
                title: "Mode Berhitung", 
                desc: "Jawab soal-soal matematika sederhana dengan bantuan visual. Pilih jawaban yang benar dari opsi yang tersedia.",
                color: "var(--primary-dark-color)"
              }
            ].map((mode, index) => (
              <GameModeItem 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.2 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                whileHover={{ 
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 400 }
                }}
              >
                <motion.div
                  animate={{ 
                    scale: hoveredIndex === index ? [1, 1.2, 1] : 1
                  }}
                  transition={{ 
                    repeat: hoveredIndex === index ? Infinity : 0, 
                    duration: 0.5 
                  }}
                  style={{ 
                    display: "inline-block", 
                    marginRight: "8px",
                    color: mode.color
                  }}
                >
                  <FontAwesomeIcon icon={mode.icon} />
                </motion.div>
                <strong>{mode.title}</strong> - {mode.desc}
              </GameModeItem>
            ))}
          </GameModeList>
        </SectionContainer>
        
        <SectionContainer
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <SectionTitle>
            <IconWrapper 
              bg="#FF9966"
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faHeart} />
            </IconWrapper>
            Sistem Permainan
          </SectionTitle>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>
              Anda memulai dengan 3 nyawa (hati). Setiap jawaban yang salah akan mengurangi 1 nyawa. 
              Jika semua nyawa habis, Anda dapat memulai ulang permainan. 
            </p>
            
            <motion.div 
              style={{ 
                display: "flex", 
                justifyContent: "center", 
                margin: "15px 0" 
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  style={{ color: "#ff5e7a", margin: "0 5px" }}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    delay: 0.7 + i * 0.2,
                    duration: 0.5
                  }}
                  whileHover={{ 
                    scale: 1.3,
                    rotate: 10, 
                    transition: { duration: 0.2 } 
                  }}
                >
                  <FontAwesomeIcon icon={faHeart} size="2x" />
                </motion.div>
              ))}
            </motion.div>
            
            <p>
              Setiap jawaban benar akan memberikan Anda umpan balik positif dan 
              mendorong Anda untuk terus belajar!
            </p>
          </motion.div>
        </SectionContainer>
        
        <SectionContainer
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <SectionTitle>
            <IconWrapper 
              bg="#70C1B3"
              whileHover={{ rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faChild} />
            </IconWrapper>
            Tentang Pengembang
          </SectionTitle>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Aplikasi ini dikembangkan untuk membantu anak-anak berkebutuhan khusus belajar 
            keterampilan dasar dengan cara yang inklusif dan menyenangkan. Kami percaya bahwa 
            setiap anak memiliki potensi untuk belajar dan tumbuh dengan dukungan yang tepat.
          </motion.p>
        </SectionContainer>
        
        <Link to="/menu" style={{ textDecoration: 'none' }}>
          <HomeButton
            whileHover={{ 
              scale: 1.05,
              y: -5
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            aria-label="Kembali ke Menu Utama"
          >
            <FontAwesomeIcon icon={faHome} /> Kembali ke Menu
          </HomeButton>
        </Link>
      </AboutContainer>
    </PageContainer>
  );
};

export default About;
