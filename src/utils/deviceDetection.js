/**
 * Utilitas untuk mendeteksi jenis perangkat
 */

// Deteksi perangkat mobile dengan user agent
export const isMobileDevice = () => {
  // Periksa user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileByUA = mobileRegex.test(userAgent);
  
  // Deteksi berdasarkan ukuran layar
  const isMobileBySize = window.innerWidth <= 1024; // Lebih permisif untuk tablet juga
  
  // Deteksi berdasarkan fitur sentuh
  const hasTouchScreen = (
    ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) || 
    ('msMaxTouchPoints' in navigator && navigator.msMaxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(pointer:coarse)').matches)
  );
  
  // Simpan hasil deteksi
  const result = isMobileByUA || isMobileBySize || hasTouchScreen;
  
  if (result) {
    console.log('Perangkat terdeteksi sebagai mobile:', {
      userAgent: isMobileByUA,
      screenSize: isMobileBySize,
      touchScreen: hasTouchScreen
    });
    sessionStorage.setItem('deviceType', 'mobile');
  } else {
    sessionStorage.setItem('deviceType', 'desktop');
  }
  
  return result;
};

// Cek apakah perangkat adalah mobile dari session storage
export const checkIsMobileFromSession = () => {
  return sessionStorage.getItem('deviceType') === 'mobile';
};

// Deteksi perubahan ukuran layar
export const setupResizeListener = (callback) => {
  let resizeTimer;
  
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMobile = window.innerWidth <= 1024;
      if (isMobile) {
        sessionStorage.setItem('deviceType', 'mobile');
      } else {
        sessionStorage.setItem('deviceType', 'desktop');
      }
      if (callback) callback(isMobile);
    }, 250);
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
};