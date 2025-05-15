import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useAudio from '../../hooks/useAudio';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  visibility: ${props => (props.$isVisible ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  transform: ${props => (props.$isVisible ? 'scale(1)' : 'scale(0.8)')};
  transition: transform 0.3s ease;
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
  // Tambahkan audio hook di dalam FeedbackModal
  const { play } = useAudio({
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    gameOver: '/sounds/game-over.mp3'
  });
  
  // Mainkan suara saat modal muncul
  useEffect(() => {
    if (isVisible) {
      // Delay kecil untuk memastikan DOM telah dirender
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
    <ModalOverlay 
      $isVisible={isVisible}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <ModalContent 
        $isVisible={isVisible}
        onClick={e => e.stopPropagation()}
      >
        {imageSrc && <Image src={imageSrc} alt="" aria-hidden="true" />}
        
        <Title id="modal-title" $isSuccess={isSuccess}>
          {title}
        </Title>
        
        <Message>
          {message}
        </Message>
        
        <ButtonContainer>
          {onAction && (
            <Button 
              className="primary"
              onClick={onAction}
            >
              {actionText}
            </Button>
          )}
          
          <Button 
            className="secondary"
            onClick={onClose}
          >
            {closeText}
          </Button>
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
