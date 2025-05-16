import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './styles/App.css'
import './styles/global.css'
import Howler from 'howler'

// Import components
import Menu from './components/UI/Menu'
import About from './components/UI/About'
import Reading from './components/GameModes/Reading'
import Writing from './components/GameModes/Writing'
import Counting from './components/GameModes/Counting'
import SplashScreen from './components/UI/SplashScreen'
import InitialScreen from './components/UI/InitialScreen'

// Import custom hooks
import useAudio from './hooks/useAudio'

// Import ErrorBoundary
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
const ErrorFallback = () => (
  <div className="error-screen">
    <h2>Terjadi Kesalahan</h2>
    <p>Maaf, terjadi kesalahan saat memuat halaman.</p>
    <button onClick={() => window.location.href="/menu"}>
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
  const { play: playClick, isAudioReady } = useAudio({
    click: '/sounds/click-button.mp3',
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3'
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

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle button clicks and audio initialization
  useEffect(() => {
    const handleButtonClick = e => {
      const isAnswerButton = e.target.closest('.answer-container');
      if (!isAnswerButton && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
        if (isAudioReady) {
          playClick('click');
        }
      }
    };
    
    document.addEventListener('click', handleButtonClick, { passive: true });
    
    // Add touchstart listener for mobile
    document.addEventListener('touchstart', () => {
      if (Howler.ctx && Howler.ctx.state !== 'running') {
        Howler.ctx.resume();
      }
    }, { once: true });
    
    return () => {
      document.removeEventListener('click', handleButtonClick);
    };
  }, [playClick, isAudioReady]);

  // Initialize audio context after user interaction
  useEffect(() => {
    const initializeAudio = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
    };

    initializeAudio();
  }, []);

  return (
    <Router>
      {/* Mobile warning message */}
      <div id="mobile-warning" className="mobile-warning">
        <h2>Peringatan Perangkat</h2>
        <p>Aplikasi ini dirancang untuk digunakan pada desktop/laptop. Silakan gunakan komputer untuk pengalaman yang lebih baik.</p>
      </div>
      
      <AnimatedRoutes />
    </Router>
  );
}

// Wrap routes with AnimatePresence
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<InitialScreen />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/counting" element={
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Counting />
          </ErrorBoundary>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
