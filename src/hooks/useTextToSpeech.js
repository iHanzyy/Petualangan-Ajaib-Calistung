import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook to handle text-to-speech functionality using Web Speech API
 * Optimized for Indonesian language
 * 
 * @returns {Object} - Functions and state for text-to-speech
 */
const useTextToSpeech = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Get available voices when component mounts
  useEffect(() => {
    const synth = window.speechSynthesis;
    
    // Function to get and set available voices
    const updateVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      
      // Try to find Indonesian voice
      const indonesianVoice = availableVoices.find(
        voice => voice.lang === 'id-ID' || voice.lang.startsWith('id')
      );
      
      if (indonesianVoice) {
        setSelectedVoice(indonesianVoice);
      } else {
        // Fallback to first available voice
        setSelectedVoice(availableVoices[0]);
      }
    };
    
    // Get voices - sometimes voices are loaded asynchronously
    updateVoices();
    
    // Chrome and other browsers may load voices asynchronously
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }
    
    // Cleanup
    return () => {
      if (synth.speaking) {
        synth.cancel();
      }
    };
  }, []);
  
  // Function to speak text
  const speak = useCallback((text, onEnd) => {
    if (!text) return;
    
    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice (Indonesian if available)
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set language to Indonesian
    utterance.lang = 'id-ID';
    utterance.rate = 0.9; // Slightly slower for educational purposes
    utterance.pitch = 1.0;
    
    // Set callbacks
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    // Speak the text
    synth.speak(utterance);
  }, [selectedVoice]);
  
  // Function to stop speaking
  const stop = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, []);
  
  return {
    speak,
    stop,
    isSpeaking,
    voices,
    selectedVoice,
    setSelectedVoice
  };
};

export default useTextToSpeech;
