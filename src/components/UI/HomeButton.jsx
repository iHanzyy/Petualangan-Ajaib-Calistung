import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import useAudio from '../../hooks/useAudio';

const StyledHomeButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  font-size: 1.3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  
  &:hover {
    transform: scale(1.1);
    background-color: #0069d9;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

/**
 * HomeButton component - A button to navigate back to the menu screen
 * 
 * @returns {JSX.Element} - Rendered component
 */
const HomeButton = ({ showText = false }) => {
  const { play } = useAudio({
    click: '/sounds/click-button.mp3'
  });
  
  const handleClick = () => {
    play('click');
    // Penting: TIDAK memanggil pauseMusic() di sini
    // Kita hanya perlu memastikan bahwa status musik disimpan di localStorage
  };
  
  return (
    <StyledHomeButton to="/menu" onClick={handleClick} aria-label="Kembali ke menu utama">
      <FontAwesomeIcon icon={faHome} />
      {showText && <span style={{ marginLeft: '0.5rem' }}>Kembali ke Menu</span>}
    </StyledHomeButton>
  );
};

export default HomeButton;
