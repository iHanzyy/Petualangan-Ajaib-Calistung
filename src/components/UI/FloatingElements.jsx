import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const FloatingElement = styled(motion.div)`
  position: absolute;
  width: ${props => props.$size || '20px'};
  height: ${props => props.$size || '20px'};
  border-radius: 50%;
  background: ${props => props.$background || 'rgba(255, 255, 255, 0.3)'};
  z-index: 0;
  pointer-events: none;
`;

const IconElement = styled(motion.div)`
  position: absolute;
  font-size: ${props => props.$size || '30px'};
  color: ${props => props.$color || 'rgba(255, 255, 255, 0.5)'};
  z-index: 0;
  pointer-events: none;
`;

const FloatingElements = ({ count = 15 }) => {
  // Set of fun emojis for children
  const emojis = ['✨', '🌟', '⭐', '💫', '🎈', '🎵', '🎶', '📚', '✏️', '🔢', '🎯', '🎮'];
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        // Random position and size
        const size = Math.floor(Math.random() * 30) + 10 + 'px';
        const top = Math.floor(Math.random() * 100) + '%';
        const left = Math.floor(Math.random() * 100) + '%';
        
        // Random colors
        const colors = [
          'rgba(255, 87, 87, 0.3)', // Red
          'rgba(255, 200, 87, 0.3)', // Yellow
          'rgba(112, 193, 179, 0.3)', // Teal
          'rgba(107, 118, 255, 0.3)', // Blue
        ];
        const background = colors[Math.floor(Math.random() * colors.length)];
        
        // Duration for animation
        const duration = Math.random() * 10 + 10;
        
        return (
          <FloatingElement
            key={`bubble-${i}`}
            $size={size}
            $background={background}
            style={{ top, left }}
            animate={{
              y: [Math.random() * 20, Math.random() * -20],
              x: [Math.random() * 20, Math.random() * -20],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: duration,
              ease: 'easeInOut',
            }}
          />
        );
      })}
      
      {/* Add floating emoji icons */}
      {Array.from({ length: 8 }).map((_, i) => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const size = Math.floor(Math.random() * 20) + 20 + 'px';
        const top = Math.floor(Math.random() * 100) + '%';
        const left = Math.floor(Math.random() * 100) + '%';
        const duration = Math.random() * 15 + 15;
        
        return (
          <IconElement
            key={`icon-${i}`}
            $size={size}
            style={{ top, left }}
            animate={{
              y: [Math.random() * 30, Math.random() * -30],
              x: [Math.random() * 30, Math.random() * -30],
              rotate: [0, 360],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: duration,
              ease: 'easeInOut',
            }}
          >
            {emoji}
          </IconElement>
        );
      })}
    </>
  );
};

export default FloatingElements;