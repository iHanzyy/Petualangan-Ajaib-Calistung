import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faTrophy } from '@fortawesome/free-solid-svg-icons';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: ${props => props.$isSuccess ? 'var(--success-color)' : 'var(--danger-color)'};
  }
`;

const Title = styled(motion.h2)`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: ${props => props.$isSuccess ? 'var(--success-color)' : 'var(--danger-color)'};
  text-align: center;
  font-weight: 700;
`;

const Message = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  text-align: center;
  color: #4a4a4a;
`;

const Image = styled(motion.img)`
  width: 150px;
  height: 150px;
  margin-bottom: 1.5rem;
  object-fit: contain;
`;

const ButtonContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled(motion.button)`
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isSuccess ? 'var(--success-color)' : 'var(--danger-color)'};
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const IconContainer = styled(motion.div)`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: ${props => props.$isSuccess ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  
  svg {
    width: 50px;
    height: 50px;
    color: ${props => props.$isSuccess ? 'var(--success-color)' : 'var(--danger-color)'};
  }
`;

const ConfettiContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
`;

const Confetti = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${props => props.color};
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

/**
 * Feedback Modal component displays success or error messages
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the modal is visible
 * @param {boolean} props.isSuccess - Whether to show success or error feedback
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message
 * @param {string} props.imageSrc - Image source URL
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onAction - Function to call when primary action button is clicked
 * @param {string} props.actionText - Text for the primary action button
 * @param {string} props.closeText - Text for the close button
 * @returns {JSX.Element} - Rendered component
 */
const FeedbackModal = ({
  isVisible,
  isSuccess = true,
  title,
  message,
  imageSrc,
  onClose,
  onAction,
  actionText = 'Lanjutkan',
  closeText = 'Tutup'
}) => {
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  
  // Initialize audio elements
  useEffect(() => {
    correctAudioRef.current = new Audio('/sounds/correct.mp3');
    wrongAudioRef.current = new Audio('/sounds/wrong.mp3');
    
    // Set volume
    correctAudioRef.current.volume = 1.0;
    wrongAudioRef.current.volume = 1.0;
    
    // Preload audio
    correctAudioRef.current.load();
    wrongAudioRef.current.load();
    
    return () => {
      if (correctAudioRef.current) {
        correctAudioRef.current.pause();
        correctAudioRef.current = null;
      }
      if (wrongAudioRef.current) {
        wrongAudioRef.current.pause();
        wrongAudioRef.current = null;
      }
    };
  }, []);
  
  // Play feedback sound when modal becomes visible
  useEffect(() => {
    let soundTimeout;
    
    if (isVisible) {
      soundTimeout = setTimeout(() => {
        try {
          if (isSuccess && correctAudioRef.current) {
            console.log('Playing correct sound');
            correctAudioRef.current.currentTime = 0;
            correctAudioRef.current.play().catch(err => {
              console.error('Error playing correct sound:', err);
            });
          } else if (!isSuccess && wrongAudioRef.current) {
            console.log('Playing wrong sound');
            wrongAudioRef.current.currentTime = 0;
            wrongAudioRef.current.play().catch(err => {
              console.error('Error playing wrong sound:', err);
            });
          }
        } catch (error) {
          console.error('Error playing feedback sound:', error);
        }
      }, 300);
    }
    
    return () => {
      if (soundTimeout) {
        clearTimeout(soundTimeout);
      }
    };
  }, [isVisible, isSuccess]);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (onAction) {
      onAction();
    }
  };

  // Animation variants
  const modalVariants = {
    hidden: { 
      scale: 0.5, 
      opacity: 0, 
      y: 50,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 15, 
        stiffness: 300,
        staggerChildren: 0.1
      }
    },
    exit: { 
      scale: 0.5, 
      opacity: 0, 
      y: 50,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        damping: 15, 
        stiffness: 300,
        delay: 0.1 
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 0, rotate: 0 },
    visible: { 
      scale: 1, 
      rotate: [0, 10, -10, 0],
      transition: { 
        delay: 0.2, 
        duration: 0.5,
        rotate: {
          duration: 0.8,
          repeat: isSuccess ? 1 : 0,
          repeatType: "reverse"
        }
      }
    }
  };

  const titleVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        delay: 0.3,
        type: "spring",
        stiffness: 200
      }
    }
  };

  const messageVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        delay: 0.4,
        type: "spring",
        stiffness: 200
      }
    }
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        delay: 0.5,
        type: "spring",
        stiffness: 200
      }
    },
    hover: { 
      scale: 1.1,
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const confettiVariants = {
    hidden: { 
      scale: 0,
      opacity: 0,
      x: 0,
      y: 0
    },
    visible: (i) => {
      const angle = (i * 72) * (Math.PI / 180); // Spread in 5 directions
      const distance = 200; // Maximum distance from center
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      return {
        scale: [0, 1, 1, 0],
        opacity: [0, 1, 1, 0],
        x: [0, x * 0.5, x, x * 1.2],
        y: [0, y * 0.5, y, y * 1.2],
        rotate: [0, 360],
        transition: {
          duration: 1.5,
          times: [0, 0.2, 0.8, 1],
          ease: "easeOut"
        }
      };
    }
  };

  // Generate more confetti particles
  const confettiColors = [
    '#FFD700', // Gold
    '#FF69B4', // Pink
    '#00CED1', // Cyan
    '#FF4500', // Orange Red
    '#7CFC00', // Lawn Green
    '#FF1493', // Deep Pink
    '#00BFFF', // Deep Sky Blue
    '#FFA500', // Orange
    '#9370DB', // Medium Purple
    '#32CD32'  // Lime Green
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <ModalContent
            $isSuccess={isSuccess}
            onClick={e => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="modal-content"
          >
            {isSuccess && (
              <ConfettiContainer>
                {confettiColors.map((color, i) => (
                  <Confetti
                    key={i}
                    color={color}
                    custom={i}
                    variants={confettiVariants}
                    initial="hidden"
                    animate="visible"
                  />
                ))}
              </ConfettiContainer>
            )}

            <IconContainer
              $isSuccess={isSuccess}
              variants={iconVariants}
              initial="hidden"
              animate="visible"
            >
              {isSuccess ? (
                <FontAwesomeIcon icon={faCheckCircle} size="3x" />
              ) : (
                <FontAwesomeIcon icon={faTimesCircle} size="3x" />
              )}
            </IconContainer>
            
            {imageSrc && (
              <Image 
                src={imageSrc} 
                alt={title} 
                aria-hidden="true"
                variants={imageVariants}
                initial="hidden"
                animate="visible"
              />
            )}
            
            <Title 
              id="modal-title" 
              $isSuccess={isSuccess}
              variants={titleVariants}
              initial="hidden"
              animate="visible"
            >
              {title}
            </Title>
            
            <Message
              variants={messageVariants}
              initial="hidden"
              animate="visible"
            >
              {message}
            </Message>
            
            <ButtonContainer>
              <ActionButton 
                onClick={handleButtonClick}
                isSuccess={isSuccess}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                {actionText}
              </ActionButton>
            </ButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

FeedbackModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  isSuccess: PropTypes.bool,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  imageSrc: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onAction: PropTypes.func,
  actionText: PropTypes.string,
  closeText: PropTypes.string
};

export default FeedbackModal;
