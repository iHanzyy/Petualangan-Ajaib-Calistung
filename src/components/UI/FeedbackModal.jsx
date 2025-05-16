import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import useAudio from '../../hooks/useAudio';

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
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.$isSuccess ? 'var(--success-color)' : 'var(--danger-color)'};
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const Image = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: #0069d9;
    }
  }
  
  &.secondary {
    background-color: var(--secondary-color);
    color: white;
    
    &:hover {
      background-color: #5a6268;
    }
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
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {imageSrc && (
              <motion.img 
                src={imageSrc} 
                alt="" 
                aria-hidden="true"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ width: '150px', height: 'auto', marginBottom: '1rem' }}
              />
            )}
            
            <Title id="modal-title" $isSuccess={isSuccess}>
              {title}
            </Title>
            
            <Message>
              {message}
            </Message>
            
            <ButtonContainer>
              {onAction && (
                <Button 
                  as={motion.button}
                  className="primary"
                  onClick={onAction}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {actionText}
                </Button>
              )}
              
              <Button 
                as={motion.button}
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {closeText}
              </Button>
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
