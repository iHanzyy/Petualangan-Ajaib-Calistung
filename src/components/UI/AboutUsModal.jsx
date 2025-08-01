import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGraduationCap, faCode } from '@fortawesome/free-solid-svg-icons';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.65);
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
`;

const ModalPanel = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 3rem;
  border-radius: 24px;
  width: 90%;
  max-width: 850px;
  position: relative;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: linear-gradient(90deg, var(--primary-color), #70C1B3);
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 1.4rem;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #555;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    color: #e74c3c;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const TitleContainer = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, #70C1B3, var(--primary-color));
    border-radius: 3px;
  }
`;

const Title = styled(motion.h2)`
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--primary-color), #70C1B3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.8rem;
  font-family: 'Cal Sans', sans-serif;
  letter-spacing: 1px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.2rem;
  text-align: center;
  margin: 0;
`;

const ProfilesContainer = styled.div`
  display: flex;
  gap: 3rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`;

const ProfileCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  width: 300px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, var(--primary-color), #70C1B3);
  }
`;

const ProfileImage = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 2rem;
  border: 5px solid #fff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: transform 0.5s ease;
`;

const DeveloperName = styled.h3`
  margin: 0.5rem 0;
  color: #333;
  font-size: 1.8rem;
  text-align: center;
  font-weight: 600;
`;

const Role = styled.p`
  font-size: 1rem;
  color: var(--primary-color);
  margin: 0.2rem 0 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  padding: 0.3rem 1rem;
  border-radius: 20px;
`;

const SchoolContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SchoolName = styled.p`
  margin: 0;
  color: #666;
  font-size: 1.1rem;
  text-align: center;
`;

const SchoolIcon = styled.span`
  color: #70C1B3;
  font-size: 1.1rem;
`;

const Divider = styled.div`
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), #70C1B3);
  border-radius: 3px;
  margin: 1rem 0;
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SocialIcon = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color-light), #70C1B3);
  color: white;
  font-size: 1.2rem;
  text-decoration: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const AboutUsModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalPanel
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton 
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>

            <TitleContainer>
              <Title
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                TENTANG KAMI
              </Title>
              <Subtitle>Para pengembang di balik Petualangan Ajaib Calistung</Subtitle>
            </TitleContainer>
            
            <ProfilesContainer>
              <ProfileCard
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <ProfileImage src="/images/jojo.jpg" alt="Mohammad Jonah S." />
                <DeveloperName>M. Jonah S </DeveloperName>
                <Role>Lead Developer</Role>
                <Divider />
                <SchoolContainer>
                  <SchoolIcon>
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </SchoolIcon>
                  <SchoolName>SMKN 1 Cibinong</SchoolName>
                </SchoolContainer>
              </ProfileCard>
              
              <ProfileCard
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ProfileImage src="/images/rafi.jpg" alt="Rafi Julian" />
                <DeveloperName>Rafi Julian</DeveloperName>
                <Role>UI/UX Designer</Role>
                <Divider />
                <SchoolContainer>
                  <SchoolIcon>
                    <FontAwesomeIcon icon={faGraduationCap} />
                  </SchoolIcon>
                  <SchoolName>SMKN 1 Cibinong</SchoolName>
                </SchoolContainer>
              </ProfileCard>
            </ProfilesContainer>
          </ModalPanel>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AboutUsModal;
