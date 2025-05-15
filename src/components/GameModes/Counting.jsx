import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';

import HomeButton from '../UI/HomeButton';
import HeartDisplay from '../UI/HeartDisplay';
import FeedbackModal from '../UI/FeedbackModal';

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
  justify-content: center;
  padding: 2rem;
  position: relative;
  min-height: 80vh;
  background-image: url('/images/background-berhitung.png');
  background-size: cover; /* Change back to 'cover' from 'contain' */
  background-position: center;
  background-repeat: no-repeat;
  
  /* Add semi-transparent overlay to ensure content remains readable */
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
  
  /* Make child elements appear above overlay */
  & > * {
    position: relative;
    z-index: 1;
  }
`;

// Add this new styled component
const HomeButtonWrapper = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
`;

const ProblemDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2.5rem;
  margin: 2rem 0;
`;

const ObjectsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
  font-size: 2rem;
`;

const AnswerContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 2rem 0;
`;

const AnswerButton = styled.button`
  font-size: 2rem;
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  background-color: var(--light-color);
  color: var(--dark-color);
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
  width: 120px;
  height: 80px;
  
  &:hover {
    transform: translateY(-5px);
    background-color: var(--primary-light-color);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const OperationSymbol = styled.span`
  font-size: 2.5rem;
  margin: 0 1rem;
`;

const EqualsSymbol = styled.span`
  font-size: 2.5rem;
  margin: 0 1rem;
`;

const QuestionMark = styled.span`
  font-size: 2.5rem;
  background-color: var(--warning-color);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

const NextButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    background-color: var(--primary-dark-color);
  }
`;

// Fungsi untuk merender objek emoji
const renderObjects = (count, emoji) => {
  if (!count || count <= 0 || !emoji) return null;
  
  // Batasi jumlah objek yang dirender untuk performa
  if (count > MAX_OBJECTS_RENDERED) {
    return (
      <span role="presentation" aria-hidden="true">{emoji} × {count}</span>
    );
  }
  
  return Array(count).fill(0).map((_, index) => (
    <span key={`${emoji}-${index}`} role="presentation" aria-hidden="true">
      {emoji}
    </span>
  ));
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
  
  const { speak } = useTextToSpeech() || { speak: () => {} };
  
  // Generate a new problem - defined before useEffect to avoid dependency issues
  const generateNewProblem = useCallback(() => {
    try {
      const newProblem = generateProblem();
      const options = generateAnswerOptions(newProblem.result);
      
      setProblem(newProblem);
      setAnswerOptions(options);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } catch (error) {
      console.error("Error generating problem:", error);
      setHasError(true);
    }
  }, []);

  // Component initialization
  useEffect(() => {
    console.log("Initializing Counting component...");
    let isMounted = true;
    let timeoutIds = [];
    
    const addTimeout = (callback, delay) => {
      const id = setTimeout(() => {
        if (isMounted) {
          callback();
        }
      }, delay);
      timeoutIds.push(id);
      return id;
    };
    
    // Memulai aplikasi dengan delay kecil untuk mencegah freeze
    addTimeout(() => {
      try {
        if (isMounted) {
          console.log("Generating first problem...");
          generateNewProblem();
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing game:", error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }, 100);
    
    // Cleanup function
    return () => {
      console.log("Cleaning up Counting component...");
      isMounted = false;
      
      // Clear all timeouts
      timeoutIds.forEach(id => clearTimeout(id));
      
      // Stop audio
      if (stopAll && typeof stopAll === 'function') {
        try {
          stopAll();
        } catch (e) {
          console.error("Error stopping audio:", e);
        }
      }
    };
  }, []);

  // Rest of the component functions
  const checkAnswer = (answer) => {
    if (isCorrect !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === problem.result;
    setIsCorrect(correct);

    try {
      // Mainkan suara dengan segera, tanpa menunggu modal
      if (correct) {
        play('correct');
        setTimeout(() => {
          setShowNextModal(true);
        }, 800);
      } else {
        play('wrong');
        // Add shake animation safely
        if (answerContainerRef.current) {
          answerContainerRef.current.classList.add('shake-animation');
          setTimeout(() => {
            if (answerContainerRef.current) {
              answerContainerRef.current.classList.remove('shake-animation');
            }
          }, 500);
        }
        // Hanya kurangi lives jika jawaban salah
        setLives(prevLives => prevLives - 1);

        if (lives <= 1) {
          setTimeout(() => {
            if (typeof play === 'function') play('gameOver');
            setGameOver(true);
          }, 1000);
        }
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <GameContainer>
        <HomeButtonWrapper>
          <HomeButton />
        </HomeButtonWrapper>
        
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
        <HomeButtonWrapper>
          <HomeButton />
        </HomeButtonWrapper>
        
        <HeartDisplay lives={lives} />
        
        <div className="error-screen">
          <h2>Terjadi Kesalahan</h2>
          <p>Maaf, terjadi kesalahan saat memuat mode berhitung.</p>
          <NextButton as="a" href="/">
            Kembali ke Menu
          </NextButton>
        </div>
      </GameContainer>
    );
  }

  // Main render
  return (
    <GameContainer>
      <HomeButtonWrapper>
        <HomeButton />
      </HomeButtonWrapper>
      
      <HeartDisplay lives={lives} />
      
      <Score>Skor: {score}</Score>
      
      <h1>Mode Berhitung</h1>
      
      {/* Only render objects if problem is defined */}
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
        <QuestionMark>?</QuestionMark>
      </ProblemDisplay>
      
      <AnswerContainer ref={answerContainerRef} className="answer-container">
        {answerOptions.map((answer, index) => (
          <AnswerButton
            onClick={() => checkAnswer(answer)}
          >
            {answer}
          </AnswerButton>
        ))}
      </AnswerContainer>
      
      {/* Accessibility button to read problem */}
      <button 
        onClick={() => speak(`${problem?.a || 0} ${problem?.operation || '+'} ${problem?.b || 0} sama dengan berapa?`)} 
        className="speech-button"
        aria-label="Bacakan soal"
      >
        Dengarkan Soal
      </button>
      
      {/* Success Modal */}
      <FeedbackModal
        isVisible={showNextModal}
        isSuccess={true}
        title="Hebat!"
        message={`Kamu berhasil menjawab dengan benar. Jawabannya adalah ${problem.result}. Lanjutkan ke soal berikutnya?`}
        imageSrc="/images/success.png"
        onClose={() => {
          setShowNextModal(false);
          generateNewProblem();
        }}
        onAction={() => {
          setShowNextModal(false);
          generateNewProblem();
        }}
        actionText="Lanjutkan"
      />
      
      {/* Game Over Modal */}
      <FeedbackModal
        isVisible={gameOver}
        isSuccess={false}
        title="Permainan Selesai"
        message={`Skor akhir kamu: ${score}. Mau coba lagi?`}
        imageSrc="/images/game-over.png"
        onClose={() => {
          setLives(3);
          setScore(0);
          setGameOver(false);
          generateNewProblem();
        }}
        onAction={() => {
          setLives(3);
          setScore(0);
          setGameOver(false);
          generateNewProblem();
        }}
        actionText="Main Lagi"
      />
    </GameContainer>
  );
};

export default Counting;
