import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faRedo, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Howler from 'howler';

import HomeButton from '../UI/HomeButton';
import HeartDisplay from '../UI/HeartDisplay';
import FeedbackModal from '../UI/FeedbackModal';
import SoundControl from '../UI/SoundControl';
import SoundButton from '../UI/SoundButton';

import useHandwriting from '../../hooks/useHandwriting';
import useAudio from '../../hooks/useAudio';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';
import useTextToSpeech from '../../hooks/useTextToSpeech';

// Sample targets for the writing game (letters and numbers)
const SAMPLE_TARGETS = [
  'A', 'B', 'C', 'D', 'E',
  '1', '2', '3', '4', '5',
  'M', 'N', 'O', 'P', 'R',
  '6', '7', '8', '9', '0'
];

const GameContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  position: relative;
  height: 100vh; /* Ubah dari min-height ke height untuk menghindari scrolling */
  width: 100%;
  background: url('/images/background-menulis.png') no-repeat center center fixed;
  background-size: cover;
  overflow: hidden; /* Konsisten dengan Reading */
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0); /* Hapus overlay putih */
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.5);
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.5rem; /* Sesuaikan padding */
  margin-bottom: -3rem;
  position: relative;
  /* Hapus background, border radius dan shadow untuk konsisten dengan mode lain */
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
  font-size: 3rem;
  margin: 0.5rem 0; /* Ubah dari 1rem menjadi 0.5rem */
  padding: 1rem 3rem; /* Kurangi padding vertikal dari 1.5rem menjadi 1rem */
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
  max-width: 90%;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CanvasContainer = styled.div`
  margin: 0.8rem 0; /* Kurangi dari 1.5rem menjadi 0.8rem */
  padding: 1rem 2rem; /* Kurangi padding vertikal dari 1.5rem menjadi 1rem */
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: fit-content;
  max-width: 90%;
`;

const DrawingCanvas = styled.canvas`
  border: 3px solid var(--secondary-color);
  border-radius: var(--border-radius);
  background-color: white;
  cursor: crosshair;
  touch-action: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  width: ${({ cw }) => cw}px;
  height: ${({ ch }) => ch}px;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin: 0.8rem 0; /* Kurangi dari 1.5rem menjadi 0.8rem */
  padding: 1rem 2rem; /* Kurangi padding vertikal dari 1.5rem menjadi 1rem */
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  justify-content: center;
  width: fit-content;
  max-width: 90%;
`;

const IconButton = styled(SoundButton)`
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
  font-size: 1.3rem; /* Kurangi dari 1.5rem untuk menghemat ruang */
  margin: 0.5rem 0; /* Kurangi dari 1rem menjadi 0.5rem */
  text-align: center;
  max-width: 600px;
  color: var(--dark-color);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.7rem 2rem; /* Kurangi padding vertikal */
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

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BetaWarning = styled(motion.div)`
  position: relative;
  background: linear-gradient(135deg, #fff9c4, #fff59d);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 90%;
  width: 450px;
  text-align: center;
  color: #333;
  border: 2px solid #ffd600;
  backdrop-filter: blur(8px);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ffd600, #ffab00);
    border-radius: 22px;
    z-index: -1;
    opacity: 0.5;
  }
`;

const BetaWarningTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: #d32f2f;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 1.6rem;
    color: #d32f2f;
  }
`;

const BetaWarningText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #424242;
  font-weight: 500;
  padding: 0 1rem;
`;

const BetaWarningButton = styled(motion.button)`
  background: linear-gradient(135deg, #4caf50, #43a047);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }
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
  const [isCorrect, setIsCorrect] = useState(false);
  const [showBetaWarning, setShowBetaWarning] = useState(true);
  
  // Custom hooks
  const { speak } = useTextToSpeech();
  const {
    canvasRef,
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
    lineWidth: 8,
    target: currentTarget
  });
  
  const { play } = useAudio({
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    click: '/sounds/click-button.mp3'
  });
  useBackgroundMusic();
  
  // Safe cancel function with direct speech synthesis cancellation
  const safeCancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);
  
  // Select a random target from the sample targets
  const selectRandomTarget = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_TARGETS.length);
    const newTarget = SAMPLE_TARGETS[randomIndex];
    setCurrentTarget(newTarget);
    clearCanvas();
    setIsCorrect(false);
    speak(`Tulis huruf ${newTarget}`);
  }, [clearCanvas, speak]);
  
  // Check if the drawn input matches the target
  const checkAnswer = useCallback(() => {
    if (!hasDrawn) return;
    
    const isDrawingCorrect = compareToTarget();
    setIsCorrect(isDrawingCorrect);
    
    if (isDrawingCorrect) {
      play('correct');
      setScore(prev => prev + 10);
      setTimeout(() => {
        setShowNextModal(true);
        speak(`Kamu berhasil menulis '${currentTarget}' dengan benar. Lanjutkan ke huruf berikutnya?`);
      }, 500);
    } else {
      play('wrong');
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          speak(`Permainan Selesai. Skor akhir kamu: ${score}. Mau coba lagi?`);
        }
        return newLives;
      });
      
      if (lives > 1) {
        setTimeout(() => {
          setShowNextModal(true);
          speak(`Tulisanmu belum tepat. Coba tulis '${currentTarget}' lagi ya!`);
        }, 500);
      }
    }
  }, [hasDrawn, compareToTarget, currentTarget, play, speak, lives, score]);
  
  // Go to next target
  const handleNextTarget = useCallback(() => {
    safeCancel();
    setShowNextModal(false);
    setTimeout(() => {
      selectRandomTarget();
    }, 300);
  }, [safeCancel, selectRandomTarget]);
  
  // Restart the game
  const restartGame = useCallback(() => {
    safeCancel();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setShowNextModal(false);
    setTimeout(() => {
      selectRandomTarget();
    }, 300);
  }, [safeCancel, selectRandomTarget]);

  // Component initialization
  useEffect(() => {
    selectRandomTarget();
    return () => {
      safeCancel();
    };
  }, [selectRandomTarget, safeCancel]);
  
  // Disable game interaction when beta warning is shown
  const isGameDisabled = showBetaWarning;

  return (
    <>
      <GameContainer>
        <HeaderContainer
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <HomeButton />
          <Score>Skor: {score}</Score>
        </HeaderContainer>
        
        <HeartDisplay lives={lives} />
        
        <Instructions
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Tulis huruf atau angka berikut dengan benar.
        </Instructions>
        
        <TargetDisplay
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.4, 
            type: "spring", 
            stiffness: 300, 
            damping: 10 
          }}
        >{currentTarget}</TargetDisplay>
        
        <CanvasContainer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ pointerEvents: isGameDisabled ? 'none' : 'auto' }}
        >
          <DrawingCanvas 
            ref={canvasRef}
            cw={300}
            ch={300}
            width={300}
            height={300}
            aria-label="Papan menulis"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ opacity: isGameDisabled ? 0.5 : 1 }}
          />
        </CanvasContainer>
        
        <ControlsContainer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ pointerEvents: isGameDisabled ? 'none' : 'auto' }}
        >
          <IconButton 
            onClick={clearCanvas}
            color="var(--danger-color)"
            aria-label="Hapus"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ opacity: isGameDisabled ? 0.5 : 1 }}
          >
            <FontAwesomeIcon icon={faEraser} />
          </IconButton>
          
          <IconButton 
            onClick={selectRandomTarget}
            color="var(--warning-color)"
            aria-label="Ganti huruf/angka"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ opacity: isGameDisabled ? 0.5 : 1 }}
          >
            <FontAwesomeIcon icon={faRedo} />
          </IconButton>
          
          <IconButton 
            onClick={checkAnswer}
            disabled={!hasDrawn}
            color="var(--success-color)"
            aria-label="Periksa jawaban"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ opacity: isGameDisabled ? 0.5 : 1 }}
          >
            <FontAwesomeIcon icon={faCheck} />
          </IconButton>
        </ControlsContainer>
      </GameContainer>
      
      <SoundControl />
      
      <FeedbackModal
        isVisible={showNextModal}
        isSuccess={isCorrect}
        title={isCorrect ? "Hebat!" : "Coba Lagi"}
        message={isCorrect 
          ? `Kamu berhasil menulis '${currentTarget}' dengan benar. Lanjutkan ke huruf berikutnya?` 
          : `Tulisanmu belum tepat. Coba tulis '${currentTarget}' lagi ya!`}
        imageSrc={isCorrect ? "/images/success.png" : "/images/try-again.png"}
        onClose={handleNextTarget}
        onAction={handleNextTarget}
        actionText={isCorrect ? "Lanjutkan" : "Coba Lagi"}
      />
      
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

      {showBetaWarning && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <BetaWarning
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <BetaWarningTitle>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              Mode Menulis (Beta)
            </BetaWarningTitle>
            <BetaWarningText>
              Mode menulis masih dalam tahap pengembangan beta. Beberapa bug mungkin masih ditemukan. Mohon dimaklumi dan berikan masukan untuk pengembangan selanjutnya.
            </BetaWarningText>
            <BetaWarningButton 
              onClick={() => setShowBetaWarning(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mengerti
            </BetaWarningButton>
          </BetaWarning>
        </Overlay>
      )}
    </>
  );
};

export default Writing;
