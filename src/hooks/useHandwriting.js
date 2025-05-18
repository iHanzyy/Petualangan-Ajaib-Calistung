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
  
  // Helper function to calculate overall stroke direction (simplified)
  const getOverallDirection = (points) => {
    if (points.length < 2) return null;
    const p1 = points[0];
    const p2 = points[points.length - 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  // Helper function to detect if a stroke is generally vertical
  const isGenerallyVertical = (points) => {
      if (points.length < 10) return false; // Need enough points
      const p1 = points[0];
      const p2 = points[points.length - 1];
      const dx = Math.abs(p2.x - p1.x);
      const dy = Math.abs(p2.y - p1.y);
      // Much taller than it is wide
      return dy > dx * 2 && dy > 30;
  };

  // Helper function to detect if a stroke is generally horizontal
  const isGenerallyHorizontal = (points) => {
      if (points.length < 10) return false; // Need enough points
      const p1 = points[0];
      const p2 = points[points.length - 1];
      const dx = Math.abs(p2.x - p1.x);
      const dy = Math.abs(p2.y - p1.y);
      // Much wider than it is tall
      return dx > dy * 2 && dx > 30;
  };

    // Helper function to detect if a stroke is generally curved (simplified - looks for changes in direction)
    const isGenerallyCurved = (points) => {
        if (points.length < 15) return false; // Need enough points to see a curve
        let turns = 0;
        let lastDirection = null;

        for (let i = 1; i < points.length; i++) {
            const currentDirection = getOverallDirection(points.slice(i - 1, i + 1)); // Check direction of very small segment
            if (currentDirection && lastDirection && currentDirection !== lastDirection) {
                 turns++;
             }
             if(currentDirection) lastDirection = currentDirection;
        }
        // A simple curve might have a few turns
        return turns >= 3;
    };

  // Helper function to check if the drawn stroke contains a significant vertical line segment
  const containsSignificantVertical = (points) => {
      if (points.length < 20) return false; // Need enough points for a substantial line
      let maxY = -Infinity, minY = Infinity;
      let startPoint = points[0];
      let currentVerticalLength = 0;
      let maxVerticalLength = 0;

      for (let i = 1; i < points.length; i++) {
          const p1 = points[i-1];
          const p2 = points[i];
          const dy = p2.y - p1.y;
          const dx = Math.abs(p2.x - p1.x);

          // Consider movement mostly vertical if dy is significantly larger than dx
          if (Math.abs(dy) > dx * 1.5) {
              currentVerticalLength += Math.abs(dy);
          } else {
              currentVerticalLength = 0; // Reset if movement is not vertical
          }
          maxVerticalLength = Math.max(maxVerticalLength, currentVerticalLength);
      }
      // Check if the longest continuous vertical movement is substantial relative to overall height
      const overallHeight = Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y));
      return maxVerticalLength > overallHeight * 0.6 && maxVerticalLength > 40; // Must be at least 60% of total height and minimum 40px
  };

  // Helper function to check if the drawn stroke contains a significant horizontal line segment
    const containsSignificantHorizontal = (points) => {
      if (points.length < 20) return false; // Need enough points
      let maxX = -Infinity, minX = Infinity;
      let currentHorizontalLength = 0;
      let maxHorizontalLength = 0;

      for (let i = 1; i < points.length; i++) {
          const p1 = points[i-1];
          const p2 = points[i];
          const dx = p2.x - p1.x;
          const dy = Math.abs(p2.y - p1.y);

          // Consider movement mostly horizontal if dx is significantly larger than dy
          if (Math.abs(dx) > dy * 1.5) {
              currentHorizontalLength += Math.abs(dx);
          } else {
              currentHorizontalLength = 0; // Reset if movement is not horizontal
          }
          maxHorizontalLength = Math.max(maxHorizontalLength, currentHorizontalLength);
      }
      // Check if the longest continuous horizontal movement is substantial relative to overall width
      const overallWidth = Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x));
      return maxHorizontalLength > overallWidth * 0.6 && maxHorizontalLength > 40; // Must be at least 60% of total width and minimum 40px
    };

  // Helper function to check if the drawn stroke contains a significant curved segment (simplified)
  const containsSignificantCurve = (points) => {
      if (points.length < 30) return false; // Need more points for a discernible curve
      // Simple approach: check if the total path length is significantly longer than the straight-line distance
      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const straightDistance = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + 
          Math.pow(endPoint.y - startPoint.y, 2)
      );

      let totalPathLength = 0;
      for (let i = 1; i < points.length; i++) {
          const p1 = points[i-1];
          const p2 = points[i];
          totalPathLength += Math.sqrt(
              Math.pow(p2.x - p1.x, 2) + 
              Math.pow(p2.y - p1.y, 2)
          );
      }
      // A curve's path length is significantly longer than the straight line between start and end
      return totalPathLength > straightDistance * 1.5 && totalPathLength > 50; // Path must be at least 1.5 times longer and minimum 50px
  };

  // Simple deterministic comparison function to check if drawing matches a target
  const compareToTarget = useCallback((target) => {
    // Basic validation - must have a minimum number of points
    if (strokeData.length < 40) { // Increased minimum points again for more reliable analysis
      return false;
    }
    
    // Calculate bounding box of the drawing
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    strokeData.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    const drawnWidth = maxX - minX;
    const drawnHeight = maxY - minY;
    
    // Check if drawing has reasonable size
    if (drawnWidth < 60 || drawnHeight < 60) { // Increased minimum size again
      return false;
    }

     // Use simplified analysis of the entire stroke data
    const hasVertical = containsSignificantVertical(strokeData);
    const hasHorizontal = containsSignificantHorizontal(strokeData);
    const hasCurve = containsSignificantCurve(strokeData);
    
    // Simplified character validation based on key components
    switch(target) {
        case 'a':
             // Expect a curve and potentially a vertical component
            return hasCurve && drawnHeight > 60;
        case 'b':
             // Expect a significant vertical line and a curve
            return hasVertical && hasCurve && drawnHeight > 80; // 'b' is tall
        case 'c':
             // Expect a significant curve
            return hasCurve && drawnHeight > 50;
        case 'd':
             // Expect a significant curve and a vertical line
            return hasCurve && hasVertical && drawnHeight > 80; // 'd' is tall
        case 'e':
             // Expect a significant curve and some horizontal extent
            return hasCurve && drawnWidth > 50 && drawnHeight > 50; // 'e' has horizontal middle
        case 'm':
             // Expect curves/arches and width
            return hasCurve && drawnWidth > 80 && drawnHeight > 60;
        case 'n':
             // Expect a vertical and a curve/arch
            return hasVertical && hasCurve && drawnHeight > 60;
        case 'o':
             // Expect a significant curve (circle/oval)
            return hasCurve && drawnWidth > 50 && drawnHeight > 50; // Circle-like
        case 'p':
             // Expect a significant vertical line and a curve, extends downwards
            return hasVertical && hasCurve && drawnHeight > 80; // 'p' is tall and low
        case 'r':
             // Expect a vertical component and maybe a small curve/hook
            return hasVertical && drawnHeight > 50;
        case '1':
             // Expect a significant vertical line
            return hasVertical && drawnHeight > 80; // '1' is very tall
        case '2':
             // Expect a significant curve
            return hasCurve && drawnHeight > 60;
        case '3':
             // Expect a significant curve
            return hasCurve && drawnHeight > 60;
        case '4':
             // Expect vertical and horizontal components
            return hasVertical && hasHorizontal && drawnHeight > 60;
        case '5':
             // Expect horizontal and curve components
            return hasHorizontal && hasCurve && drawnHeight > 60;
        case '6':
             // Expect a significant curve
            return hasCurve && drawnHeight > 60;
        case '7':
             // Expect a significant horizontal component
            return hasHorizontal && drawnHeight > 50;
        case '8':
             // Expect a significant curve (or two)
            return hasCurve && drawnHeight > 60;
        case '9':
             // Expect a significant curve
            return hasCurve && drawnHeight > 60;
        case '0':
             // Expect a significant curve (oval)
            return hasCurve && drawnWidth > 50 && drawnHeight > 60; // Oval-like
      
      default:
        return false;
    }
  }, [strokeData]); // Dependencies simplified to just strokeData
  
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
