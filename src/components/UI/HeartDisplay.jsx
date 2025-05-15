import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

/**
 * HeartDisplay component - Displays hearts as life indicators
 * 
 * @param {Object} props - Component props
 * @param {number} props.lives - Current number of lives
 * @param {number} props.maxLives - Maximum number of lives
 * @returns {JSX.Element} - Rendered component
 */
const HeartDisplay = ({ lives, maxLives = 3 }) => {
  return (
    <div className="hearts-container" aria-label={`${lives} dari ${maxLives} nyawa tersisa`}>
      {Array.from({ length: maxLives }).map((_, index) => (
        <span 
          key={index} 
          className="heart"
          aria-hidden="true"
        >
          <FontAwesomeIcon 
            icon={faHeart} 
            style={{ 
              color: index < lives ? '#dc3545' : '#dee2e6',
              transition: 'all 0.3s ease'
            }} 
          />
        </span>
      ))}
    </div>
  );
};

HeartDisplay.propTypes = {
  lives: PropTypes.number.isRequired,
  maxLives: PropTypes.number
};

export default HeartDisplay;
