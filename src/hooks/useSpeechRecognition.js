import { useState, useEffect, useCallback, useRef } from 'react';

// Modern browsers prefix the SpeechRecognition API differently
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Custom hook to handle speech recognition using Web Speech API
 * Optimized for Indonesian language
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.continuous - Whether to continuously listen
 * @param {boolean} options.interimResults - Whether to return interim results
 * @param {number} options.maxRetries - Maximum number of retry attempts for network errors
 * @returns {Object} - Speech recognition state and controls
 */
const useSpeechRecognition = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = options.maxRetries || 3;

  // Initialize speech recognition with options
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!SpeechRecognition) {
      setError('Maaf, browser kamu tidak mendukung Speech Recognition API');
      return;
    }

    // Create a new recognition instance
    const initializeRecognition = () => {
      recognitionRef.current = new SpeechRecognition();
      
      // Set recognition options
      recognitionRef.current.continuous = options.continuous || false;
      recognitionRef.current.interimResults = options.interimResults || false;
      recognitionRef.current.lang = 'id-ID'; // Set language to Indonesian
      
      // Event handlers
      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const text = lastResult[0].transcript;
        setTranscript(text);
      };
      
      recognitionRef.current.onerror = (event) => {
        if (event.error === 'network') {
          // Provide a more helpful message for network errors
          const friendlyMessage = 'Masalah koneksi jaringan. Pastikan kamu terhubung ke internet dan coba lagi.';
          console.log(`Network error encountered. Retry count: ${retryCountRef.current}`);
          
          // Attempt to retry if we haven't exceeded max retries
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current += 1;
            setError(`${friendlyMessage} Mencoba ulang... (${retryCountRef.current}/${maxRetries})`);
            
            // Wait briefly before retrying
            setTimeout(() => {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (err) {
                  setError('Gagal melakukan percobaan ulang. Silakan coba lagi secara manual.');
                  setIsListening(false);
                }
              }
            }, 1000);
          } else {
            setError(`${friendlyMessage} Silakan periksa koneksi internet Anda dan coba lagi.`);
            setIsListening(false);
            retryCountRef.current = 0;
          }
        } else {
          // Handle other types of errors
          let errorMessage = 'Terjadi kesalahan dalam pengenalan suara: ';
          
          switch (event.error) {
            case 'no-speech':
              errorMessage += 'Tidak ada suara terdeteksi. Silakan coba lagi.';
              break;
            case 'audio-capture':
              errorMessage += 'Tidak dapat mengakses mikrofon. Pastikan mikrofon terhubung dan izin diberikan.';
              break;
            case 'not-allowed':
              errorMessage += 'Izin mikrofon ditolak. Silakan berikan izin mikrofon di pengaturan browser.';
              break;
            case 'aborted':
              errorMessage += 'Pengenalan suara dibatalkan.';
              break;
            default:
              errorMessage += `Error: ${event.error}`;
          }
          
          setError(errorMessage);
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onend = () => {
        // Only set isListening to false if we're not in continuous mode
        // and not attempting to retry after a network error
        if (!options.continuous && retryCountRef.current === 0) {
          setIsListening(false);
        }
      };
    };
    
    initializeRecognition();

    // Clean up
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options.continuous, options.interimResults, maxRetries]);

  // Start listening
  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    retryCountRef.current = 0;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
        setError('Gagal memulai pengenalan suara. Silakan coba lagi.');
      }
    } else {
      setError('Speech recognition tidak tersedia');
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      retryCountRef.current = 0;
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
