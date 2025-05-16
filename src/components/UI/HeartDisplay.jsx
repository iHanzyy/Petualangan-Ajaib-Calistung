import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

// Animasi detak jantung untuk hati aktif
const heartbeat = keyframes`
  0% { transform: scale(1); }
  15% { transform: scale(1.25); }
  30% { transform: scale(1); }
  45% { transform: scale(1.25); }
  60% { transform: scale(1); }
`;

// Animasi untuk hati yang hilang/berkurang
const heartLost = keyframes`
  0% { transform: scale(1); opacity: 1; }
  20% { transform: scale(1.4); opacity: 0.8; }
  40% { transform: scale(0.9) rotate(15deg); opacity: 0.6; }
  60% { transform: scale(1.2) rotate(-15deg); opacity: 0.4; }
  80% { transform: scale(0.8) rotate(15deg); opacity: 0.2; }
  100% { transform: scale(0) rotate(-15deg); opacity: 0; }
`;

// Animasi untuk hati saat pertama muncul
const heartEntrance = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  50% { transform: translateY(-10px); opacity: 0.8; }
  100% { transform: translateY(0); opacity: 1; }
`;

const HeartsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 15px 0;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 0 6px rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.6);
`;

const HeartWrapper = styled.span`
  display: inline-block;
  font-size: 2rem;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
  animation: ${heartEntrance} 0.5s ease-out forwards;
  animation-delay: ${props => props.$index * 0.2}s;
  opacity: 0;
  transform-origin: center;
  
  &:hover {
    transform: scale(1.2);
  }
  
  svg {
    color: ${props => props.$active ? 'red' : '#aaaaaa'};
    animation: ${props => props.$active ? heartbeat : props.$justLost ? heartLost : 'none'} 
              ${props => props.$active ? '1.5s infinite' : '0.7s forwards'};
    filter: drop-shadow(0 0 3px ${props => props.$active ? 'rgba(255, 94, 122, 0.5)' : 'transparent'});
  }
`;

/**
 * HeartDisplay component - Displays hearts as life indicators with fun animations
 * 
 * @param {Object} props - Component props
 * @param {number} props.lives - Current number of lives
 * @param {number} props.maxLives - Maximum number of lives
 * @returns {JSX.Element} - Rendered component
 */
const HeartDisplay = ({ lives, maxLives = 3 }) => {
  // Track previous lives for lost heart animation
  const [prevLives, setPrevLives] = React.useState(lives);
  const justLostHeart = React.useRef([false, false, false]);
  
  React.useEffect(() => {
    if (lives < prevLives) {
      // Mark which hearts were just lost for animation
      for (let i = lives; i < prevLives; i++) {
        justLostHeart.current[i] = true;
      }
      
      // Reset the animation flag after animation completes
      const timer = setTimeout(() => {
        justLostHeart.current = [false, false, false];
      }, 700); // matches animation duration
      
      return () => clearTimeout(timer);
    }
    setPrevLives(lives);
  }, [lives, prevLives]);

  return (
    <HeartsContainer aria-label={`${lives} dari ${maxLives} nyawa tersisa`}>
      {Array.from({ length: maxLives }).map((_, index) => (
        <HeartWrapper 
          key={index}
          $index={index}
          $active={index < lives}
          $justLost={justLostHeart.current[index]}
          className="heart"
          aria-hidden="true"
        >
          <FontAwesomeIcon 
            icon={faHeart} 
            size="lg"
          />
        </HeartWrapper>
      ))}
    </HeartsContainer>
  );
};

HeartDisplay.propTypes = {
  lives: PropTypes.number.isRequired,
  maxLives: PropTypes.number
};

export default HeartDisplay;
