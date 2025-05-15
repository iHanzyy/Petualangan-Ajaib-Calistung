import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'

// Import components
import Menu from './components/UI/Menu'
import About from './components/UI/About'
import Reading from './components/GameModes/Reading'
import Writing from './components/GameModes/Writing'
import Counting from './components/GameModes/Counting'
import SplashScreen from './components/UI/SplashScreen' // ← import SplashScreen

// Import custom hooks
import useBackgroundMusic from './hooks/useBackgroundMusic'
import useAudio from './hooks/useAudio' // ← import useAudio
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons'

// Import ErrorBoundary
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-screen">
    <h2>Terjadi Kesalahan</h2>
    <p>Maaf, terjadi kesalahan saat memuat halaman.</p>
    <button onClick={() => window.location.href="/"}>
      Kembali ke Menu
    </button>
  </div>
);

/**
 * Main App component with routing setup
 * 
 * @returns {JSX.Element} - Rendered component
 */
function App() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showSplash, setShowSplash] = useState(true); // ← tambahkan state showSplash
  const { isPlaying, isMuted, toggle, toggleMute } = useBackgroundMusic();
  const { play: playClick } = useAudio({
    click: '/sounds/click-button.mp3'
  });

  // Check if device is mobile (small screen)
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const mobileWarning = document.getElementById('mobile-warning');
      if (mobileWarning) {
        mobileWarning.style.display = isMobile ? 'flex' : 'none';
      }
    };

    // Check on mount and window resize
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Start background music after user interaction
  useEffect(() => {
    if (hasInteracted && !isPlaying) {
      toggle();
    }
  }, [hasInteracted, isPlaying, toggle]);

  // global listener untuk semua <button>
  useEffect(() => {
    // Batasi pemutaran audio button click
    let lastClickTime = 0;
    
    const handleButtonClick = e => {
      // Hanya play click untuk tombol yang bukan jawaban
      const isAnswerButton = e.target.closest('.answer-container');
      if (!isAnswerButton && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
        playClick('click');
      }
    };
    
    document.addEventListener('click', handleButtonClick, { passive: true });
    
    // Tambahkan touchstart listener untuk mobile
    document.addEventListener('touchstart', () => {
      // Touch event untuk "unlock" audio di perangkat mobile
      if (playClick && typeof playClick === 'function') {
        // Suara silent untuk unlock
        const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAYGBgYGBgYGBgYGBgYGBgkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwP//////////////////////////////////////////////AAAAAExhdmM1OC41NAAAAAAAAAAAAAAAACQDgAAAAAAAAAGwvZ6RmgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
        silentSound.play().catch(() => {}); // Silent catch untuk mencegah error
      }
    }, { once: true });
    
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, [playClick]);

  // Tambahkan useEffect untuk mengatur splash screen
  useEffect(() => {
    // Sembunyikan splash screen setelah beberapa detik
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 4500);
    
    return () => clearTimeout(splashTimer);
  }, []);

  // Preload semua suara yang dibutuhkan di aplikasi
  useEffect(() => {
    const preloadAudio = (src) => {
      const audio = new Audio();
      audio.src = src;
      // Prevent actual playback, we just want to load the file
      audio.volume = 0;
      audio.preload = 'auto';
      
      // Force load
      audio.load();
      console.log(`Preloading audio: ${src}`);
      
      // You can also try this approach:
      setTimeout(() => {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(e => {
          console.log(`Preload error for ${src}:`, e);
        });
      }, 1000);
    };
    
    // Preload all the sound files
    preloadAudio('/sounds/correct.mp3');
    preloadAudio('/sounds/wrong.mp3');
    preloadAudio('/sounds/game-over.mp3');
    preloadAudio('/sounds/click-button.mp3');
  }, []);

  // Handle initial user interaction
  const handleInitialInteraction = () => {
    setHasInteracted(true);
  };

  return (
    <Router onClick={hasInteracted ? undefined : handleInitialInteraction}>
      {/* Music controls */}
      <div className="music-controls">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            playClick('click'); // ← jika ingin manual
            toggleMute();
          }} 
          aria-label={isMuted ? "Aktifkan musik" : "Matikan musik"}
          title={isMuted ? "Aktifkan musik" : "Matikan musik"}
        >
          <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
        </button>
      </div>
      
      {/* Mobile warning message */}
      <div id="mobile-warning" className="mobile-warning">
        <h2>Peringatan Perangkat</h2>
        <p>Aplikasi ini dirancang untuk digunakan pada desktop/laptop. Silakan gunakan komputer untuk pengalaman yang lebih baik.</p>
      </div>
      
      <Routes>
        {/* Splash screen route */}
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/" element={showSplash ? <Navigate to="/splash" /> : <Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/counting" element={
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Counting />
          </ErrorBoundary>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
