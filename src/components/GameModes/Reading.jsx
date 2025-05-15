import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVolumeUp, faSync } from '@fortawesome/free-solid-svg-icons';

import HomeButton from '../UI/HomeButton';
import HeartDisplay from '../UI/HeartDisplay';
import FeedbackModal from '../UI/FeedbackModal';

import useTextToSpeech from '../../hooks/useTextToSpeech';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useAudio from '../../hooks/useAudio';

// Sample words for the reading game (Indonesian)
const SAMPLE_WORDS = [
  'Buku', 'Rumah', 'Makan', 'Minum', 'Sekolah', 
  'Belajar', 'Bermain', 'Tidur', 'Jalan', 'Lari',
  'Mobil', 'Sepeda', 'Bunga', 'Pohon', 'Hujan',
  'Matahari', 'Bulan', 'Bintang', 'Langit', 'Laut'
];

// Function to get image path for a word
const getWordImagePath = (word) => {
  return `/images/${word.toLowerCase()}.png`;
};

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  min-height: 80vh;
  background: url('/images/background-membaca.png') no-repeat center center;
  background-size: cover;
`;

const WordDisplay = styled.div`
  font-size: 3rem;
  margin: 2rem 0;
  padding: 1rem 2rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  text-align: center;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
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
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.7 : 1)};
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const Instructions = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  text-align: center;
  max-width: 600px;
`;

const TranscriptDisplay = styled.div`
  background-color: ${props => props.$isCorrect !== null 
    ? props.$isCorrect 
      ? 'rgba(40, 167, 69, 0.2)' 
      : 'rgba(220, 53, 69, 0.2)' 
    : 'rgba(0, 0, 0, 0.05)'
  };
  padding: 1rem;
  border-radius: var(--border-radius);
  margin: 1rem 0;
  min-width: 300px;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: background-color 0.3s ease;
`;

const StatusText = styled.p`
  font-size: 1.2rem;
  font-style: italic;
  color: ${props => props.color || 'var(--secondary-color)'};
  margin-top: 1rem;
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
 * Reading game mode component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const Reading = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showNextModal, setShowNextModal] = useState(false);
  
  // Custom hooks
  const { speak, isSpeaking } = useTextToSpeech();
  const { transcript, isListening, error, startListening, stopListening, resetTranscript } = 
    useSpeechRecognition({ continuous: false });
  const { play } = useAudio({
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    gameOver: '/sounds/game-over.mp3'
  });
  
  // Select a random word on component mount
  useEffect(() => {
    selectRandomWord();
  }, []);
  
  // Check transcript against current word when transcript changes
  useEffect(() => {
    if (transcript && !isListening) {
      checkAnswer();
    }
  }, [transcript, isListening]);
  
  // Select a random word from the sample words
  const selectRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_WORDS.length);
    setCurrentWord(SAMPLE_WORDS[randomIndex]);
    resetTranscript();
    setIsCorrect(null);
  };
  
  // Speak the current word
  const speakWord = useCallback(() => {
    speak(currentWord);
  }, [speak, currentWord]);
  
  // Start listening for user's spoken response
  const handleStartListening = () => {
    resetTranscript();
    setIsCorrect(null);
    startListening();
  };
  
  // Check if the user's response matches the current word
  const checkAnswer = () => {
    if (!transcript) return;
    
    // Case insensitive comparison
    const isAnswerCorrect = 
      transcript.trim().toLowerCase() === currentWord.toLowerCase();
    
    setIsCorrect(isAnswerCorrect);
    
    try {
      if (isAnswerCorrect) {
        play('correct'); // Mainkan suara benar langsung
        setScore(prevScore => prevScore + 10);
        setShowNextModal(true);
      } else {
        play('wrong'); // Mainkan suara salah langsung
        
        // Tambahkan efek getar pada TranscriptDisplay
        const transcriptElement = document.querySelector('.transcript-display');
        if (transcriptElement) {
          transcriptElement.classList.add('shake-animation');
          setTimeout(() => {
            transcriptElement.classList.remove('shake-animation');
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
  
  // Go to next word
  const handleNextWord = () => {
    setShowNextModal(false);
    selectRandomWord();
  };
  
  // Restart the game
  const restartGame = () => {
    setLives(3);
    setScore(0);
    setGameOver(false);
    selectRandomWord();
  };
  
  return (
    <GameContainer>
      <HomeButton />
      
      <HeartDisplay lives={lives} />
      
      <Score>Skor: {score}</Score>
      
      <h1>Mode Membaca</h1>
      
      <Instructions>
        Dengarkan kata berikut, lalu ucapkan dengan jelas ke mikrofon.
      </Instructions>
      
      <WordDisplay>{currentWord}</WordDisplay>
      
      <TranscriptDisplay 
        $isCorrect={isCorrect}
        className="transcript-display"
      >
        {transcript ? transcript : isListening ? 'Mendengarkan...' : 'Belum ada ucapan'}
      </TranscriptDisplay>
      
      {error && (
        <StatusText color="var(--danger-color)">
          Error: {error}
        </StatusText>
      )}
      
      <ControlsContainer>
        <IconButton 
          onClick={speakWord} 
          disabled={isSpeaking}
          color="var(--info-color)"
          aria-label="Dengarkan kata"
        >
          <FontAwesomeIcon icon={faVolumeUp} />
        </IconButton>
        
        <IconButton 
          onClick={handleStartListening} 
          disabled={isListening || isSpeaking}
          color="var(--success-color)"
          aria-label="Mulai bicara"
        >
          <FontAwesomeIcon icon={faMicrophone} />
        </IconButton>
        
        <IconButton 
          onClick={selectRandomWord}
          disabled={isListening || isSpeaking}
          aria-label="Ganti kata"
        >
          <FontAwesomeIcon icon={faSync} />
        </IconButton>
      </ControlsContainer>
      
      {isListening && (
        <StatusText color="var(--success-color)">
          Mendengarkan... Silakan ucapkan kata di atas.
        </StatusText>
      )}
      
      {/* Success Modal with dynamic image based on current word */}
      <FeedbackModal
        isVisible={showNextModal}
        isSuccess={true}
        title="Hebat!"
        message={`Kamu berhasil mengucapkan '${currentWord}' dengan benar. Lanjutkan ke kata berikutnya?`}
        imageSrc={getWordImagePath(currentWord)}
        onClose={handleNextWord}
        onAction={handleNextWord}
        actionText="Kata Berikutnya"
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

export default Reading;
