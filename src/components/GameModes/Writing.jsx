import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faRedo, faCheck } from '@fortawesome/free-solid-svg-icons';

import HomeButton from '../UI/HomeButton';
import HeartDisplay from '../UI/HeartDisplay';
import FeedbackModal from '../UI/FeedbackModal';

import useHandwriting from '../../hooks/useHandwriting';
import useAudio from '../../hooks/useAudio';

// Sample targets for the writing game (letters and numbers)
const SAMPLE_TARGETS = [
  'A', 'B', 'C', 'D', 'E',
  '1', '2', '3', '4', '5',
  'M', 'N', 'O', 'P', 'R',
  '6', '7', '8', '9', '0'
];

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  position: relative;
  height: 100vh;
  width: 100%;
  background: url('/images/background-menulis.png') no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.3);
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  position: relative;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--primary-color);
  text-align: center;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
`;

const TargetDisplay = styled.div`
  font-size: 5rem;
  margin: 2rem 0;
  padding: 2rem 4rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CanvasContainer = styled.div`
  margin: 2rem 0;
  position: relative;
  background-color: white;
  padding: 1rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const DrawingCanvas = styled.canvas`
  border: 3px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background-color: white;
  cursor: crosshair;
  touch-action: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  width: 300px;
  height: 300px;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  justify-content: center;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  font-size: 2rem;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const Instructions = styled.p`
  font-size: 1.5rem;
  margin: 1rem 0;
  text-align: center;
  max-width: 600px;
  color: var(--dark-color);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Score = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 1.8rem;
  font-weight: bold;
  background-color: var(--light-color);
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
`;

/**
 * Writing game mode component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const Writing = () => {
  const [currentTarget, setCurrentTarget] = useState('');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showNextModal, setShowNextModal] = useState(false);
  
  // Custom hooks
  const {
    canvasRef,
    isDrawing,
    hasDrawn,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    compareToTarget
  } = useHandwriting({
    width: 300,
    height: 300,
    lineColor: '#333',
    lineWidth: 8
  });
  
  const { play } = useAudio({
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    gameOver: '/sounds/game-over.mp3',
    clear: '/sounds/erase.mp3'
  });
  
  // Select a random target on component mount
  useEffect(() => {
    selectRandomTarget();
  }, []);
  
  // Set up canvas event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch events for mobile devices
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    
    return () => {
      // Remove event listeners on cleanup
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing]);
  
  // Select a random target from the sample targets
  const selectRandomTarget = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TARGETS.length);
    setCurrentTarget(SAMPLE_TARGETS[randomIndex]);
    clearCanvas();
  };
  
  // Handle canvas clearing
  const handleClearCanvas = () => {
    clearCanvas();
    play('clear');
  };
  
  // Check if the drawn input matches the target
  const checkAnswer = () => {
    if (!hasDrawn) return;
    
    // Compare the drawn input with the target
    const { isMatch } = compareToTarget(currentTarget);
    
    try {
      if (isMatch) {
        play('correct'); // Mainkan suara benar langsung
        setScore(prevScore => prevScore + 10);
        setShowNextModal(true);
      } else {
        play('wrong'); // Mainkan suara salah langsung

        // Tambahkan efek getar pada canvas
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.classList.add('shake-animation');
          setTimeout(() => {
            canvas.classList.remove('shake-animation');
          }, 500);
        }

        setLives(prevLives => prevLives - 1);

        if (lives <= 1) {
          setTimeout(() => {
            play('gameOver');
            setGameOver(true);
          }, 500);
        }
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };
  
  // Go to next target
  const handleNextTarget = () => {
    setShowNextModal(false);
    selectRandomTarget();
  };
  
  // Restart the game
  const restartGame = () => {
    setLives(3);
    setScore(0);
    setGameOver(false);
    selectRandomTarget();
  };
  
  return (
    <GameContainer>
      <HeaderContainer>
        <HomeButton />
        <Score>Skor: {score}</Score>
      </HeaderContainer>
      
      <HeartDisplay lives={lives} />
      
      <Instructions>
        Tuliskan huruf atau angka berikut pada papan menulis di bawah.
      </Instructions>
      
      <TargetDisplay>{currentTarget}</TargetDisplay>
      
      <CanvasContainer>
        <DrawingCanvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          aria-label="Papan menulis"
        />
      </CanvasContainer>
      
      <ControlsContainer>
        <IconButton 
          onClick={handleClearCanvas} 
          color="var(--danger-color)"
          aria-label="Hapus"
        >
          <FontAwesomeIcon icon={faEraser} />
        </IconButton>
        
        <IconButton 
          onClick={selectRandomTarget} 
          color="var(--warning-color)"
          aria-label="Ganti huruf/angka"
        >
          <FontAwesomeIcon icon={faRedo} />
        </IconButton>
        
        <IconButton 
          onClick={checkAnswer} 
          disabled={!hasDrawn}
          color="var(--success-color)"
          aria-label="Periksa jawaban"
        >
          <FontAwesomeIcon icon={faCheck} />
        </IconButton>
      </ControlsContainer>
      
      {/* Success Modal */}
      <FeedbackModal
        isVisible={showNextModal}
        isSuccess={true}
        title="Hebat!"
        message={`Kamu berhasil menulis '${currentTarget}' dengan benar. Lanjutkan ke huruf/angka berikutnya?`}
        imageSrc="/images/success.png"
        onClose={handleNextTarget}
        onAction={handleNextTarget}
        actionText="Lanjutkan"
      />
      
      {/* Game Over Modal */}
      <FeedbackModal
        isVisible={gameOver}
        isSuccess={false}
        title="Permainan Selesai"
        message={`Skor akhir kamu: ${score}. Mau coba lagi?`}
        imageSrc="/images/game-over.png"
        onClose={restartGame}
        onAction={restartGame}
        actionText="Main Lagi"
      />
    </GameContainer>
  );
};

export default Writing;
