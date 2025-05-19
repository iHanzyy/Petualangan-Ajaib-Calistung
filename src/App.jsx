import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './styles/App.css';
import './styles/global.css';
import { Howler } from 'howler';

// Import components
import Menu from './components/UI/Menu';
import About from './components/UI/About';
import Reading from './components/GameModes/Reading';
import Writing from './components/GameModes/Writing';
import Counting from './components/GameModes/Counting';
import SplashScreen from './components/UI/SplashScreen';
import InitialScreen from './components/UI/InitialScreen';
import PageTransition from './components/UI/PageTransition';
import MobileWarning from './components/UI/MobileWarning';

// Import utility functions
import { isMobileDevice, checkIsMobileFromSession, setupResizeListener } from './utils/deviceDetection';

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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Deteksi mobile device saat aplikasi dimuat
    const checkDevice = () => {
      const detected = isMobileDevice() || checkIsMobileFromSession();
      setIsMobile(detected);
      
      // Jika perangkat mobile, nonaktifkan scroll
      if (detected) {
        document.body.style.overflow = 'hidden';
      }
    };
    
    // Jalankan deteksi awal
    checkDevice();
    
    // Setup listener untuk perubahan ukuran layar
    const cleanupResizeListener = setupResizeListener((detected) => {
      setIsMobile(detected);
      if (detected) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Set up Howler config once at app initialization
    Howler.autoUnlock = true;
    Howler.autoSuspend = false;
    Howler.html5PoolSize = 10;
    
    // Coba inisialisasi audio context
    const initializeAudio = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
    };
    
    // Hanya inisialisasi audio di perangkat desktop
    if (!isMobile) {
      initializeAudio();
    }
    
    return () => {
      cleanupResizeListener();
    };
  }, []);
  
  // Jika perangkat adalah mobile, tampilkan hanya MobileWarning
  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <Router>
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
        <Route path="/" element={<PageTransition type="fade"><InitialScreen /></PageTransition>} />
        <Route path="/splash" element={<PageTransition type="blend" background="transparent"><SplashScreen /></PageTransition>} />
        <Route path="/menu" element={<PageTransition type="fade"><ErrorBoundary FallbackComponent={ErrorFallback}><Menu /></ErrorBoundary></PageTransition>} />
        <Route path="/about" element={<PageTransition type="fade"><ErrorBoundary FallbackComponent={ErrorFallback}><About /></ErrorBoundary></PageTransition>} />
        <Route path="/reading" element={<PageTransition type="fade"><ErrorBoundary FallbackComponent={ErrorFallback}><Reading /></ErrorBoundary></PageTransition>} />
        <Route path="/writing" element={<PageTransition type="fade"><ErrorBoundary FallbackComponent={ErrorFallback}><Writing /></ErrorBoundary></PageTransition>} />
        <Route path="/counting" element={<PageTransition type="fade"><ErrorBoundary FallbackComponent={ErrorFallback}><Counting /></ErrorBoundary></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
