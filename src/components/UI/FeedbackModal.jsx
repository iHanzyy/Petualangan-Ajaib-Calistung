import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import useAudio from '../../hooks/useAudio';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

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

const Title = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: ${props => props.$isSuccess ? 'var(--success-color)' : 'var(--danger-color)'};
  text-align: center;
  font-weight: 700;
`;

const Message = styled.p`
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
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
  const { play } = useAudio({
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    click: '/sounds/click-button.mp3'
  });
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (isSuccess) {
          play('correct');
        } else {
          play('wrong');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isSuccess, play]);

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    play('click');
    // Call onAction immediately to stop any ongoing speech
    if (onAction) {
      onAction();
    }
  };

  if (!isVisible) return null;

  return (
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
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
      >
        <IconContainer
          $isSuccess={isSuccess}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
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
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        )}
        
        <Title id="modal-title" $isSuccess={isSuccess}>
          {title}
        </Title>
        
        <Message>
          {message}
        </Message>
        
        <ButtonContainer>
          <ActionButton 
            onClick={handleButtonClick}
            isSuccess={isSuccess}
          >
            {actionText}
          </ActionButton>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
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
