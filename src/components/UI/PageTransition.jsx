import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Wrapper dengan fixed height dan overflow hidden untuk mencegah scrolling
const TransitionWrapper = styled(motion.div)`
  width: 100%;
  height: 100vh; // Menggunakan height tetap, bukan min-height
  position: fixed; // Menggunakan fixed alih-alih absolute
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden; // Mencegah scrolling
`;

// Overlay animasi yang akan menutupi seluruh layar
const AnimationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$background || '#ffffff'};
  z-index: 999;
  pointer-events: none;
  transform-origin: center;
`;

// Content container yang tetap dalam viewport
const ContentContainer = styled.div`
  width: 100%;
  height: 100%; // Menggunakan height 100% untuk mengisi parent
  display: flex;
  flex-direction: column;
  overflow-y: auto; // Memungkinkan scrolling hanya pada konten jika diperlukan
  -webkit-overflow-scrolling: touch; // Untuk smooth scrolling di iOS
`;

// Objek animasi untuk berbagai tipe transisi
const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" } // Sedikit lebih cepat
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  slideLeft: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  zoom: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  bounce: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

// Animasi overlay yang lebih cepat untuk menghindari flash putih
const overlayAnimations = {
  fade: {
    initial: { opacity: 1 },
    animate: { opacity: 0 },
    exit: { opacity: 1 },
    transition: { duration: 0.25, ease: "easeInOut" }
  },
  slideUp: {
    initial: { y: 0 },
    animate: { y: '-100%' },
    exit: { y: 0 },
    transition: { duration: 0.25, ease: "easeInOut" }
  },
  slideLeft: {
    initial: { x: 0 },
    animate: { x: '-100%' },
    exit: { x: 0 },
    transition: { duration: 0.25, ease: "easeInOut" }
  },
  zoom: {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 1.5, opacity: 0 },
    exit: { scale: 1, opacity: 1 },
    transition: { duration: 0.25, ease: "easeInOut" }
  },
  bounce: {
    initial: { y: 0 },
    animate: { y: '-100%' },
    exit: { y: 0 },
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 35
    }
  }
};

// Komponen PageTransition yang lebih baik
const PageTransition = ({ children, type = "fade", background = "var(--primary-color)" }) => {
  // Pilih animasi berdasarkan tipe
  const animation = animations[type] || animations.fade;
  const overlayAnimation = overlayAnimations[type] || overlayAnimations.fade;
  
  return (
    <>
      <TransitionWrapper 
        {...animation}
        className="page-transition"
      >
        <ContentContainer>
          {children}
        </ContentContainer>
      </TransitionWrapper>
      
      <AnimatePresence mode="wait">
        <AnimationOverlay
          key="overlay"
          {...overlayAnimation}
          $background={background}
        />
      </AnimatePresence>
    </>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['fade', 'slideUp', 'slideLeft', 'zoom', 'bounce']),
  background: PropTypes.string
};

export default PageTransition;