import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle canvas drawing and simple handwriting recognition
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.width - Canvas width
 * @param {number} options.height - Canvas height
 * @param {string} options.lineColor - Drawing line color
 * @param {number} options.lineWidth - Drawing line width
 * @returns {Object} - Canvas ref and drawing controls
 */
const useHandwriting = ({
  width = 300,
  height = 300,
  lineColor = '#000',
  lineWidth = 5
} = {}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeData, setStrokeData] = useState([]);
  
  // Set up the canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = lineColor;
    
    // Make sure the canvas dimensions are set correctly
    canvas.width = width;
    canvas.height = height;
    
    // Clear the canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [width, height, lineColor, lineWidth]);
  
  // Start drawing function
  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    setIsDrawing(true);
    
    // Get the correct position for both mouse and touch events
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Start new stroke data
    setStrokeData(prev => [...prev, { x, y }]);
    setHasDrawn(true);
    
    // Prevent default behavior for touch events
    e.preventDefault();
  }, []);
  
  // Draw function
  const draw = useCallback((e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get the correct position for both mouse and touch events
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Add to stroke data
    setStrokeData(prev => [...prev, { x, y }]);
    
    // Prevent default behavior for touch events
    e.preventDefault();
  }, [isDrawing]);
  
  // Stop drawing function
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);
  
  // Clear canvas function
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStrokeData([]);
    setHasDrawn(false);
  }, []);
  
  // Simple deterministic comparison function to check if drawing matches a target
  const compareToTarget = useCallback((target) => {
    // Basic validation - must have a minimum number of points
    if (strokeData.length < 20) {
      return { isMatch: false, confidence: 0.1 };
    }
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    strokeData.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    // Get some basic metrics about the drawing
    const width = maxX - minX;
    const height = maxY - minY;
    const area = width * height;
    const strokeCount = strokeData.length;
    
    // Check if drawing has reasonable size and complexity
    if (width < 30 || height < 30) {
      return { isMatch: false, confidence: 0.2 };
    }
    
    // Different character types typically have different stroke complexity
    // This is a very simplified check but better than random results
    let expectedComplexity = 50; // Default complexity
    
    if (/[A-Z]/.test(target)) {
      // Letters generally need more strokes
      expectedComplexity = 60;
      
      // Some letters are more complex
      if (['B', 'E', 'M', 'N', 'R'].includes(target)) {
        expectedComplexity = 80;
      }
    } else if (/[0-9]/.test(target)) {
      // Numbers generally need fewer strokes
      expectedComplexity = 40;
      
      // Some numbers are more complex
      if (['2', '3', '5', '8'].includes(target)) {
        expectedComplexity = 50;
      }
    }
    
    // Check if stroke count is in a reasonable range for the expected complexity
    const minStrokeCount = expectedComplexity * 0.7;
    const maxStrokeCount = expectedComplexity * 1.5;
    
    // Use stroke density as a measure of "deliberate" drawing
    const density = strokeCount / area * 1000; // Scale factor to get reasonable numbers
    
    // Determine if it's a match based on our simplified criteria
    const isMatch = 
      strokeCount >= minStrokeCount && 
      strokeCount <= maxStrokeCount &&
      density >= 0.5 && 
      density <= 10;
    
    // Calculate confidence based on how close to expected values
    let confidence = 0.3;
    if (isMatch) {
      confidence = 0.7 + Math.min((density - 0.5) / 10, 0.3);
    }
    
    return { isMatch, confidence };
  }, [strokeData]);
  
  // Get the canvas as an image
  const getImageData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    return canvas.toDataURL('image/png');
  }, []);
  
  return {
    canvasRef,
    isDrawing,
    hasDrawn,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    compareToTarget,
    getImageData,
    strokeData
  };
};

export default useHandwriting;
