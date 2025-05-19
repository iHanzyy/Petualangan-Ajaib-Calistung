import { useCallback, useRef } from 'react';

/**
 * Custom hook untuk text-to-speech dengan antrian dan penanganan error yang lebih baik
 * 
 * @returns {Object} - Controls untuk text-to-speech
 */
const useTextToSpeech = () => {
  const speechQueue = useRef([]);
  const isSpeaking = useRef(false);
  const currentUtterance = useRef(null);

  // Fungsi untuk memproses antrian
  const processQueue = useCallback(() => {
    if (speechQueue.current.length === 0 || isSpeaking.current) {
      return;
    }

    isSpeaking.current = true;
    const text = speechQueue.current.shift();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onend = () => {
      isSpeaking.current = false;
      currentUtterance.current = null;
      processQueue(); // Proses antrian berikutnya
    };

    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event);
      isSpeaking.current = false;
      currentUtterance.current = null;
      
      // Jika error bukan karena interupsi, coba ulang
      if (event.error !== 'interrupted') {
        speechQueue.current.unshift(text);
      }
      
      processQueue();
    };

    currentUtterance.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Fungsi untuk berbicara
  const speak = useCallback((text) => {
    if (!text) return;

    // Batalkan speech yang sedang berlangsung jika ada
    if (currentUtterance.current) {
      window.speechSynthesis.cancel();
      isSpeaking.current = false;
      currentUtterance.current = null;
    }

    // Tambahkan ke antrian
    speechQueue.current.push(text);
    processQueue();
  }, [processQueue]);

  // Fungsi untuk menghentikan speech
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    speechQueue.current = [];
    isSpeaking.current = false;
    currentUtterance.current = null;
  }, []);

  return { speak, stop };
};

export default useTextToSpeech;
