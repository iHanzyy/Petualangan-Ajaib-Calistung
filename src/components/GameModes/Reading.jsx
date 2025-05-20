import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVolumeUp, faSync, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faChrome } from '@fortawesome/free-brands-svg-icons';
import { motion } from 'framer-motion';
import Howler from 'howler';

import HomeButton from '../UI/HomeButton';
import HeartDisplay from '../UI/HeartDisplay';
import FeedbackModal from '../UI/FeedbackModal';
import SoundControl from '../UI/SoundControl';
import SoundButton from '../UI/SoundButton';

import useTextToSpeech from '../../hooks/useTextToSpeech';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useAudio from '../../hooks/useAudio';
import useBackgroundMusic from '../../hooks/useBackgroundMusic';

// Sample words for the reading game (Indonesian)
const SAMPLE_WORDS = [
  'Buku', 'Rumah', 'Makan', 'Minum', 'Sekolah', 
  'Belajar', 'Bermain', 'Tidur', 'Jalan', 'Lari',
  'Mobil', 'Sepeda', 'Bunga', 'Pohon', 'Hujan',
  'Matahari', 'Bulan', 'Bintang', 'Langit', 'Laut'
];

// Function to get image path for a word
const getWordImagePath = (word) => {
  // Special cases for specific words
  if (word === 'Langit') return '/images/langit.jpg';
  if (word === 'Laut') return '/images/laut.jpg';
  
  // Default case for other words
  return `/images/${word.toLowerCase()}.png`;
};

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  position: relative;
  height: 100vh;
  width: 100%;
  background: url('/images/background-membaca.png') no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
  
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

  /* Ensure modals appear above all other content */
  & > div[role="dialog"] {
    z-index: 1000;
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

const WordDisplay = styled.div`
  font-size: 4rem;
  margin: 2rem 0;
  padding: 2rem 4rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  justify-content: center;
`;

const IconButton = styled(SoundButton)`
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
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.7 : 1)};
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active:not(:disabled) {
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

const TranscriptDisplay = styled.div`
  background-color: ${props => props.$isCorrect !== null 
    ? props.$isCorrect 
      ? 'rgba(40, 167, 69, 0.2)' 
      : 'rgba(220, 53, 69, 0.2)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  padding: 1.5rem;
  border-radius: var(--border-radius);
  margin: 1rem 0;
  min-width: 300px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const StatusText = styled.p`
  font-size: 1.3rem;
  font-style: italic;
  color: ${props => props.color || 'var(--secondary-color)'};
  margin-top: 0.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
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

const BrowserWarning = styled(motion.div)`
  position: relative;
  background: linear-gradient(135deg, #f2f9fe, #e6f3ff);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 90%;
  width: 450px;
  text-align: center;
  color: #333;
  border: 2px solid #4285f4;
  backdrop-filter: blur(8px);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #4285f4, #34a853);
    border-radius: 22px;
    z-index: -1;
    opacity: 0.3;
  }
`;

const BrowserWarningTitle = styled.h3`
  font-size: 1.8rem;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: #4285f4;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 1.6rem;
    color: #4285f4;
  }
`;

const ChromeLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  font-size: 3rem;
  color: #4285f4;
`;

const BrowserWarningText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #424242;
  font-weight: 500;
  padding: 0 1rem;
`;

const BrowserWarningButton = styled(motion.button)`
  background: linear-gradient(135deg, #4285f4, #3367d6);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(66, 133, 244, 0.4);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
  }
`;

/**
 * Reading game mode component
 * 
 * @returns {JSX.Element} - Rendered component
 */
const Reading = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [modalWord, setModalWord] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showNextModal, setShowNextModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  
  // Tambahkan state untuk browser warning modal
  const [showBrowserWarning, setShowBrowserWarning] = useState(true);
  
  // Custom hooks
  const { speak, isSpeaking } = useTextToSpeech();
  const { transcript, isListening, error, startListening, resetTranscript } = 
    useSpeechRecognition({ continuous: false });
  const { play } = useAudio({
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    click: '/sounds/click-button.mp3'
  });
  const { playMusic, pauseMusic } = useBackgroundMusic();
  
  // Initialize audio context and background music
  useEffect(() => {
    const initializeAudio = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      playMusic();
    };

    // Add click listener to initialize audio
    const handleClick = () => {
      initializeAudio();
      document.removeEventListener('click', handleClick);
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [playMusic]);
  
  // Safe cancel function with direct speech synthesis cancellation
  const safeCancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

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
  const selectRandomWord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_WORDS.length);
    const newWord = SAMPLE_WORDS[randomIndex];
    setCurrentWord(newWord);
    resetTranscript();
    setIsCorrect(null);
    speak(newWord);
  }, [speak, resetTranscript]);
  
  // Speak the current word
  const speakWord = useCallback(() => {
    safeCancel();
    speak(currentWord);
  }, [speak, currentWord, safeCancel]);
  
  // Start listening for user's spoken response
  const handleStartListening = () => {
    safeCancel();
    resetTranscript();
    setIsCorrect(null);
    startListening();
    speak("Silakan ucapkan kata di atas");
  };
  
  // Check if the user's response matches the current word
  const checkAnswer = () => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    const normalizedWord = currentWord.toLowerCase().trim();
    const isCorrect = normalizedTranscript === normalizedWord;
    
    setIsCorrect(isCorrect);
    
    if (isCorrect) {
      play('correct');
      setScore(prev => prev + 10);
      setTimeout(() => {
        setModalWord(currentWord);
        setModalImage(getWordImagePath(currentWord));
        setShowNextModal(true);
        speak(`Kamu berhasil mengucapkan "${currentWord}" dengan benar. Lanjutkan ke kata berikutnya?`);
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
          speak(`Pengucapanmu belum tepat. Coba ucapkan "${currentWord}" lagi ya!`);
        }, 500);
      }
    }
  };
  
  // Go to next word
  const handleNextWord = () => {
    safeCancel();
    setShowNextModal(false);
    setTimeout(() => {
      selectRandomWord();
    }, 300);
  };
  
  // Restart the game
  const restartGame = () => {
    safeCancel();
    setLives(3);
    setScore(0);
    setGameOver(false);
    setShowNextModal(false);
    setTimeout(() => {
      selectRandomWord();
    }, 300);
  };
  
  // Component initialization
  useEffect(() => {
    selectRandomWord();
    return () => {
      safeCancel();
    };
  }, [selectRandomWord, safeCancel]);
  
  // Fungsi untuk menutup modal peringatan browser
  const handleCloseBrowserWarning = () => {
    setShowBrowserWarning(false);
  };
  
  return (
    <>
      <GameContainer>
        <HeaderContainer>
          <HomeButton />
          <Score>Skor: {score}</Score>
        </HeaderContainer>
        
        <HeartDisplay lives={lives} />
        
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
      </GameContainer>

      <SoundControl />

      {/* Feedback Modal */}
      <FeedbackModal
        isVisible={showNextModal}
        isSuccess={isCorrect}
        title={isCorrect ? "Hebat!" : "Coba Lagi"}
        message={isCorrect 
          ? `Kamu berhasil mengucapkan "${modalWord}" dengan benar. Lanjutkan ke kata berikutnya?` 
          : `Pengucapanmu belum tepat. Coba ucapkan "${currentWord}" lagi ya!`}
        imageSrc={isCorrect ? modalImage : "/images/try-again.png"}
        onClose={handleNextWord}
        onAction={handleNextWord}
        actionText={isCorrect ? "Lanjutkan" : "Coba Lagi"}
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
      
      {/* Tambahkan Browser Warning Modal */}
      {showBrowserWarning && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <BrowserWarning
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            <BrowserWarningTitle>
              <FontAwesomeIcon icon={faExclamationCircle} />
              Rekomendasi Browser
            </BrowserWarningTitle>
            
            <ChromeLogoContainer>
              <FontAwesomeIcon icon={faChrome} />
            </ChromeLogoContainer>
            
            <BrowserWarningText>
              Untuk pengalaman terbaik dalam Mode Membaca, gunakan browser Google Chrome. Fitur pengenalan suara bekerja optimal pada Chrome versi terbaru.
            </BrowserWarningText>
            
            <BrowserWarningButton 
              onClick={handleCloseBrowserWarning}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mengerti
            </BrowserWarningButton>
          </BrowserWarning>
        </Overlay>
      )}
    </>
  );
};

export default Reading;
