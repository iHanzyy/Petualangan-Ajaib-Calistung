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
  justify-content: center;
  padding: 2rem;
  position: relative;
  min-height: 80vh;
  background-image: url('/images/background-menulis.png'); /* Add your background image */
  background-size: cover; /* This makes the image cover the container */
  background-position: center; /* Centers the image */
  background-repeat: no-repeat; /* Prevents image from repeating */
`;

const TargetDisplay = styled.div`
  font-size: 5rem;
  margin: 1rem 0;
  padding: 1rem 2rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  text-align: center;
`;

const CanvasContainer = styled.div`
  margin: 2rem 0;
  position: relative;
`;

const DrawingCanvas = styled.canvas`
  border: 3px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background-color: white;
  cursor: crosshair;
  touch-action: none; /* Prevents default touch actions on mobile devices */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  font-size: 1.5rem;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const Instructions = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
  max-width: 600px;
`;

const Score = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  background-color: var(--light-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
      <HomeButton />
      
      <HeartDisplay lives={lives} />
      
      <Score>Skor: {score}</Score>
      
      <h1>Mode Menulis</h1>
      
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
