import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

import HomeButton from '../UI/HomeButton';
import HeartDisplay from '../UI/HeartDisplay';
import FeedbackModal from '../UI/FeedbackModal';
import SoundControl from '../UI/SoundControl'; // Tambahkan import SoundControl

import useAudio from '../../hooks/useAudio';
import useTextToSpeech from '../../hooks/useTextToSpeech';

// Konstanta untuk batasan maksimum objek yang dirender
const MAX_OBJECTS_RENDERED = 10;
const PROBLEM_SIZE_LIMIT = 10;

// Emoji objects for visual representation
const OBJECTS = ['🍎', '🍌', '🍊', '🍐', '🍇', '🍉', '🍓', '🍒', '🥕', '🐶', '🐱', '🌟'];

// Generate a random math problem
const generateProblem = (maxNumber = PROBLEM_SIZE_LIMIT) => {
  const safeMaxNumber = Math.min(maxNumber, PROBLEM_SIZE_LIMIT);
  const operation = Math.random() > 0.5 ? '+' : '-';
  let a, b;
  
  if (operation === '+') {
    a = Math.floor(Math.random() * (safeMaxNumber - 2)) + 1; // max 9
    b = Math.floor(Math.random() * (safeMaxNumber - a - 1)) + 1; // ensure sum <= 10
  } else {
    a = Math.floor(Math.random() * (safeMaxNumber - 1)) + 2; // min 2
    b = Math.floor(Math.random() * (a - 1)) + 1; // ensure positive result
  }
  
  const result = operation === '+' ? a + b : a - b;
  
  return { 
    a, 
    b, 
    operation, 
    result,
    objectType: OBJECTS[Math.floor(Math.random() * OBJECTS.length)]
  };
};

// Generate answer options
const generateAnswerOptions = (correctAnswer) => {
  // Safety check
  if (correctAnswer === undefined || correctAnswer === null) {
    return [0, 1, 2, 3]; // Default values
  }
  
  const options = [correctAnswer];
  
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 5) - 2;
    const wrongAnswer = correctAnswer + offset;
    
    if (
      wrongAnswer >= 0 && 
      wrongAnswer <= 20 && 
      wrongAnswer !== correctAnswer && 
      !options.includes(wrongAnswer)
    ) {
      options.push(wrongAnswer);
    }
  }
  
  return options.sort(() => Math.random() - 0.5);
};

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: url('/images/background-berhitung.png') no-repeat center center fixed;
  background-size: cover;
  overflow-y: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0);
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
  margin-bottom: 0.5rem;
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

const ProblemDisplay = styled.div`
  font-size: 3rem;
  margin: 1rem 0;
  padding: 1.5rem 2rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: nowrap;
  width: fit-content;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ObjectsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1.5rem 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-height: 120px;
  flex-wrap: nowrap;
  width: fit-content;
`;

const ObjectWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const AnswerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1.5rem;
  margin: 1.5rem 0;
  padding: 1.5rem 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: nowrap;
  width: fit-content;
`;

const AnswerButton = styled.button`
  font-size: 2.8rem;
  font-weight: bold;
  padding: 1.2rem;
  background-color: white;
  border: 3px solid var(--secondary-color);
  border-radius: 50%;
  width: 90px;
  height: 90px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.1);
    background-color: var(--secondary-color);
    color: white;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const OperationSymbol = styled.span`
  font-size: 3rem;
  color: var(--primary-color);
  flex-shrink: 0;
  margin: 0 0.5rem;
`;

const EqualsSymbol = styled.span`
  font-size: 3rem;
  color: var(--primary-color);
  flex-shrink: 0;
  margin: 0 0.5rem;
`;

const QuestionMark = styled.div`
  width: 60px;
  height: 60px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

const SpeechButton = styled.button`
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  font-size: 1.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin: 1rem auto;
  
  &:hover {
    transform: scale(1.1);
    
  }
  
  &:active {
    transform: scale(0.95);
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

// Fungsi untuk merender objek emoji
const renderObjects = (count, emoji) => {
  if (!count || count <= 0 || !emoji) return null;
  
  // Batasi jumlah objek yang dirender untuk performa
  if (count > MAX_OBJECTS_RENDERED) {
    return (
      <ObjectWrapper role="presentation" aria-hidden="true">
        {emoji} × {count}
      </ObjectWrapper>
    );
  }
  
  return Array(count).fill(0).map((_, index) => (
    <ObjectWrapper key={`${emoji}-${index}`} role="presentation" aria-hidden="true">
      {emoji}
    </ObjectWrapper>
  ));
};

const getOperationText = (operation) => {
  return operation === '+' ? 'ditambah' : 'dikurang';
};

/**
 * Counting game mode component
 */
const Counting = () => {
  // Initialize with default empty problem to prevent null errors
  const [problem, setProblem] = useState({ a: 0, b: 0, operation: '+', result: 0, objectType: OBJECTS[0] });
  const [answerOptions, setAnswerOptions] = useState([0, 1, 2, 3]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showNextModal, setShowNextModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const answerContainerRef = React.useRef(null);
  
  // Custom hooks with error handling
  const { play, stopAll } = useAudio({
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    gameOver: '/sounds/game-over.mp3'
  }) || { play: () => {}, stopAll: () => {} };
  
  const { speak, cancel } = useTextToSpeech() || { speak: () => {}, cancel: () => {} };

  // Safe cancel function with direct speech synthesis cancellation
  const safeCancel = useCallback(() => {
    if (cancel && typeof cancel === 'function') {
      cancel();
    }
    // Direct cancellation of speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [cancel]);

  // Generate a new problem
  const generateNewProblem = useCallback(() => {
    const newProblem = generateProblem();
    const options = generateAnswerOptions(newProblem.result);
    setProblem(newProblem);
    setAnswerOptions(options);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, []);

  // Handle next problem
  const handleNextProblem = useCallback(() => {
    safeCancel();
    setShowNextModal(false);
    generateNewProblem();
  }, [safeCancel, generateNewProblem]);

  // Restart the game
  const restartGame = useCallback(() => {
    safeCancel();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setShowNextModal(false);
    generateNewProblem();
  }, [safeCancel, generateNewProblem]);

  const handleModalAction = useCallback(() => {
    safeCancel();
    setShowNextModal(false);
    if (gameOver) {
      restartGame();
    } else {
      handleNextProblem();
    }
  }, [safeCancel, gameOver, handleNextProblem, restartGame]);

  const checkAnswer = useCallback((selectedAnswer) => {
    const correct = selectedAnswer === problem.result;
    setIsCorrect(correct);
    setSelectedAnswer(selectedAnswer);
    
    // Cancel any ongoing speech before starting new one
    safeCancel();
    
    if (speak && typeof speak === 'function') {
      speak(selectedAnswer.toString());
    }
    
    if (correct) {
      play('correct');
      setScore(prev => prev + 10);
      setTimeout(() => {
        setShowNextModal(true);
        if (speak && typeof speak === 'function') {
          speak(`Kamu berhasil menjawab dengan benar. Jawabannya adalah ${problem.result}. Lanjutkan ke soal berikutnya?`);
        }
      }, 1000);
    } else {
      play('wrong');
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          // Add TTS for game over
          if (speak && typeof speak === 'function') {
            speak(`Permainan Selesai. Skor akhir kamu: ${score}. Mau coba lagi?`);
          }
        }
        return newLives;
      });
      if (lives > 1) { // Only show modal if not game over
        setTimeout(() => {
          setShowNextModal(true);
          if (speak && typeof speak === 'function') {
            speak(`Jawabanmu belum tepat. Jawaban yang benar adalah ${problem.result}. Coba lagi ya!`);
          }
        }, 1000);
      }
    }
  }, [problem, play, speak, safeCancel, lives, score]);

  // Component initialization
  useEffect(() => {
    generateNewProblem();
    setIsLoading(false);

    return () => {
      if (stopAll && typeof stopAll === 'function') {
        stopAll();
      }
      safeCancel();
    };
  }, [generateNewProblem, stopAll, safeCancel]);

  // Render loading state
  if (isLoading) {
    return (
      <GameContainer>
        <HeaderContainer>
          <HomeButton />
          <Score>Skor: {score}</Score>
        </HeaderContainer>
        <HeartDisplay lives={lives} />
        <div className="loading-screen">
          <h2>Memuat...</h2>
        </div>
      </GameContainer>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <GameContainer>
        <HeaderContainer>
          <HomeButton />
          <Score>Skor: {score}</Score>
        </HeaderContainer>
        <HeartDisplay lives={lives} />
        <div className="error-screen">
          <h2>Terjadi Kesalahan</h2>
          <p>Maaf, terjadi kesalahan saat memuat mode berhitung.</p>
          <SpeechButton onClick={() => window.location.reload()}>
            Coba Lagi
          </SpeechButton>
        </div>
      </GameContainer>
    );
  }

  // Main render
  return (
    <>
      <GameContainer>
        <HeaderContainer>
          <HomeButton />
          <Score>Skor: {score}</Score>
        </HeaderContainer>
        
        <HeartDisplay lives={lives} />
        
        {problem && problem.objectType && (
          <ObjectsContainer>
            {renderObjects(problem.a, problem.objectType)}
            <OperationSymbol>{problem.operation}</OperationSymbol>
            {renderObjects(problem.b, problem.objectType)}
          </ObjectsContainer>
        )}
        
        <ProblemDisplay>
          <span>{problem?.a || 0}</span>
          <OperationSymbol>{problem?.operation || '+'}</OperationSymbol>
          <span>{problem?.b || 0}</span>
          <EqualsSymbol>=</EqualsSymbol>
          <span>?</span>
        </ProblemDisplay>
        
        <AnswerContainer ref={answerContainerRef} className="answer-container">
          {answerOptions.map((answer, index) => (
            <AnswerButton
              key={index}
              onClick={() => checkAnswer(answer)}
              disabled={selectedAnswer !== null}
            >
              {answer}
            </AnswerButton>
          ))}
        </AnswerContainer>

        <SpeechButton 
          onClick={() => speak(`${problem?.a || 0} ${getOperationText(problem?.operation || '+')} ${problem?.b || 0} sama dengan berapa?`)} 
          aria-label="Bacakan soal"
        >
          <FontAwesomeIcon icon={faVolumeUp} />
        </SpeechButton>
      </GameContainer>

      {/* Tambahkan SoundControl di luar GameContainer */}
      <SoundControl />
      
      {/* Feedback Modal */}
      <FeedbackModal
        isVisible={showNextModal}
        isSuccess={isCorrect}
        title={isCorrect ? "Hebat!" : "Coba Lagi"}
        message={isCorrect 
          ? `Kamu berhasil menjawab dengan benar. Jawabannya adalah ${problem.result}. Lanjutkan ke soal berikutnya?` 
          : `Jawabanmu belum tepat. Jawaban yang benar adalah ${problem.result}. Coba lagi ya!`}
        imageSrc={isCorrect ? "/images/success.png" : "/images/try-again.png"}
        onClose={handleModalAction}
        onAction={handleModalAction}
        actionText={isCorrect ? "Lanjutkan" : "Coba Lagi"}
      />
      
      {/* Game Over Modal */}
      <FeedbackModal
        isVisible={gameOver}
        isSuccess={false}
        title="Permainan Selesai"
        message={`Skor akhir kamu: ${score}. Mau coba lagi?`}
        imageSrc="/images/game-over.png"
        onClose={handleModalAction}
        onAction={handleModalAction}
        actionText="Main Lagi"
      />
    </>
  );
};

export default Counting;
