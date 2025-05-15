import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const StyledHomeButton = styled(Link)`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-size: 1.5rem;
  text-decoration: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    transform: scale(1.1);
    background-color: #0069d9;
    text-decoration: none;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

/**
 * HomeButton component - A button to navigate back to the home screen
 * 
 * @returns {JSX.Element} - Rendered component
 */
const HomeButton = () => {
  return (
    <StyledHomeButton to="/" aria-label="Kembali ke Menu Utama">
      <FontAwesomeIcon icon={faHome} />
    </StyledHomeButton>
  );
};

export default HomeButton;
