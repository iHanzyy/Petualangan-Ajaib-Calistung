import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPencilAlt, faCalculator, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

// Styled components for more engaging UI
const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  min-height: 100vh;
  background-image: url('images/background-menu.png'); /* Replace with your background image */
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
    background-color: rgba(255, 255, 255, 0.3); /* Semi-transparent overlay for better text readability */
    z-index: 0;
  }
`;

// Meningkatkan kontras untuk title, subtitle, dan button container
const Title = styled.h1`
  font-size: 3rem;
  color: var(--primary-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const Subtitle = styled.h2`
  font-size: 1.8rem;
  color: var(--secondary-color);
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
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

const MenuButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  font-size: 1.8rem;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border-radius: var(--border-radius);
  text-decoration: none;
  text-align: center;
  justify-content: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    text-decoration: none;
  }
  
  &:active {
    transform: translateY(0px);
  }
`;

const IconWrapper = styled.span`
  font-size: 1.5rem;
`;

/**
 * Main Menu component for game mode selection
 * 
 * @returns {JSX.Element} Rendered component
 */
const Menu = () => {
  return (
    <MenuContainer>
      <Title>Petualangan Ajaib Calistung</Title>
      <Subtitle>Mari Belajar Membaca, Menulis, dan Berhitung!</Subtitle>
      
      <ButtonsContainer>
        <MenuButton to="/reading" color="var(--primary-color)" aria-label="Mode Membaca">
          <IconWrapper><FontAwesomeIcon icon={faBook} /></IconWrapper>
          Mode Membaca
        </MenuButton>
        
        <MenuButton to="/writing" color="var(--success-color)" aria-label="Mode Menulis">
          <IconWrapper><FontAwesomeIcon icon={faPencilAlt} /></IconWrapper>
          Mode Menulis
        </MenuButton>
        
        <MenuButton to="/counting" color="var(--warning-color)" aria-label="Mode Berhitung">
          <IconWrapper><FontAwesomeIcon icon={faCalculator} /></IconWrapper>
          Mode Berhitung
        </MenuButton>
        
        <MenuButton to="/about" color="var(--info-color)" aria-label="Tentang Permainan">
          <IconWrapper><FontAwesomeIcon icon={faInfoCircle} /></IconWrapper>
          Tentang Permainan
        </MenuButton>
      </ButtonsContainer>
    </MenuContainer>
  );
};

export default Menu;
