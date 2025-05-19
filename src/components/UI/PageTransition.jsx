import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

// Wrapper untuk page content dengan persistent background to avoid white flashes
// Ini mungkin tidak diperlukan jika background diatur di komponen halaman itu sendiri
const PageWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  min-height: 100vh;
  /* Background should ideally be set on the page component itself */
  /* background-color: ${props => props.$background}; */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

// Fullscreen overlay to mask transitions
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$background || 'black'}; // Gunakan default black agar lebih pasti menutupi
  z-index: 1000;
  pointer-events: none;
`;

// Variants for page content animation
const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Variants for overlay fade
// Overlay start visible, quickly fade out on mount (initial page load or entry)
// and quickly fade in on exit (before next page mounts)
const overlayVariants = {
  initial: { opacity: 1 }, // Overlay starts fully opaque
  animate: { opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }, // Overlay quickly fades out
  exit: { opacity: 1, transition: { duration: 0.4, ease: 'easeInOut' } } // Overlay quickly fades in to cover exit
};

// Objek animasi untuk berbagai tipe transisi content
const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  slideLeft: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  // Tambahkan tipe lain jika diperlukan
};


/**
 * PageTransition component to wrap routed pages.
 * Uses AnimatePresence to wait for exit before enter,
 * a fullscreen overlay to mask white background,
 * and smooth fade/slide animations for content.
 */
const PageTransition = ({ children, type = "fade", background = 'var(--primary-color)' }) => {
  const location = useLocation();

  // Pilih animasi konten berdasarkan tipe
  const pageAnimation = animations[type] || animations.fade;

  return (
    <AnimatePresence mode="wait" initial={false}> {/* initial={false} prevents initial mount animation */} 
      {/* Mask to prevent white flash between routes - appears quickly */} 
      <Overlay
        key="overlay"
        $background={background}
        variants={overlayVariants}
        initial="initial"
        animate="animate" // This will run immediately after mount
        exit="exit" // This will run when the component is about to unmount
      />

      {/* Animated page container keyed by path */}
      <motion.div 
        key={location.pathname}
        style={{ width: '100%', minHeight: '100vh', overflowY: 'auto' }} // Ensure container fills space
        variants={pageAnimation} // Use selected page animation
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.keys(animations)), // Allow selecting animation type
  background: PropTypes.string
};

export default PageTransition;