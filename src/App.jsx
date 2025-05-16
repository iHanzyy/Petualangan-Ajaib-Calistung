import React, { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './styles/App.css'
import './styles/global.css'
import { Howler } from 'howler'

// Import components
import Menu from './components/UI/Menu'
import About from './components/UI/About'
import Reading from './components/GameModes/Reading'
import Writing from './components/GameModes/Writing'
import Counting from './components/GameModes/Counting'
import SplashScreen from './components/UI/SplashScreen'
import InitialScreen from './components/UI/InitialScreen'
import PageTransition from './components/UI/PageTransition'
import MobileWarning from './components/UI/MobileWarning' // Tambahkan import

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
  // Set up Howler config once at app initialization
  useEffect(() => {
    // Ensure we use a single global AudioContext
    Howler.autoUnlock = true;
    Howler.autoSuspend = false;
    Howler.html5PoolSize = 10;
    
    console.log("App initialized Howler settings");
    
    // Setup global error handler for Howler
    window.addEventListener('error', (e) => {
      if (e.message.includes('howler') || e.filename?.includes('howler')) {
        console.error('Howler error caught:', e);
        // Attempt to recover audio context if needed
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().catch(err => 
            console.error('Failed to resume audio context after error:', err)
          );
        }
      }
    });
    
    return () => {
      // Clean up on app unmount (rare case)
      console.log("App unmounting, cleaning up Howler");
      Howler.unload();
    };
  }, []);

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
      {/* Gunakan komponen MobileWarning alih-alih div biasa */}
      <div id="mobile-warning" className="mobile-warning">
        <MobileWarning />
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
        <Route path="/" element={
          <PageTransition type="fade">
            <InitialScreen />
          </PageTransition>
        } />
        <Route path="/splash" element={
          <PageTransition type="fade">
            <SplashScreen />
          </PageTransition>
        } />
        <Route path="/menu" element={
          <PageTransition type="slideUp">
            <Menu />
          </PageTransition>
        } />
        <Route path="/about" element={
          <PageTransition type="slideLeft">
            <About />
          </PageTransition>
        } />
        <Route path="/reading" element={
          <PageTransition type="slideLeft" background="var(--primary-color)">
            <Reading />
          </PageTransition>
        } />
        <Route path="/writing" element={
          <PageTransition type="slideLeft" background="var(--success-color)">
            <Writing />
          </PageTransition>
        } />
        <Route path="/counting" element={
          <PageTransition type="slideLeft" background="var(--primary-dark-color)">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Counting />
            </ErrorBoundary>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
