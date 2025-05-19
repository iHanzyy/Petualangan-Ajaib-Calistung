// hooks/useHandwriting.js

import { useRef, useState, useCallback, useEffect } from 'react';

// Gambar template garis putus-putus
function drawDashedTemplate(ctx, target, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.font = "bold 160px Arial";
  ctx.strokeStyle = "#d0d0d0";
  ctx.setLineDash([8, 12]);
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(target, width / 2, height / 2);
  ctx.restore();
}

// Overlay template di canvas user untuk debug
function drawTemplateOnUserCanvas(ctx, target, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.font = "bold 160px Arial";
  ctx.strokeStyle = "#0088ff";
  ctx.setLineDash([8, 12]);
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(target, width / 2, height / 2);
  ctx.restore();
}

export default function useHandwriting({
  width = 250,
  height = 250,
  lineColor = '#333',
  lineWidth = 4,
  target = ''
}) {
  const canvasRef = useRef(null);
  const templateCanvasRef = useRef(document.createElement('canvas'));
  const [hasDrawn, setHasDrawn] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const lastPointRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Setup/reset canvas — scale ONCE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    if (debugMode) {
      drawTemplateOnUserCanvas(ctx, target, width, height);
    }
  }, [width, height, lineColor, lineWidth, target, debugMode]);

  // Setup template canvas offscreen — scale ONCE
  useEffect(() => {
    const tpl = templateCanvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    tpl.width = width * dpr;
    tpl.height = height * dpr;
    tpl.style.width = `${width}px`;
    tpl.style.height = `${height}px`;

    const ctx = tpl.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    drawDashedTemplate(ctx, target, width, height);
  }, [target, width, height]);

  const toggleDebugMode = useCallback(() => {
    setDebugMode(d => !d);
  }, []);

  // Hitung posisi pointer dalam pixel CSS (context sudah di-scale satu kali)
  const getPointer = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Mulai menggambar
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    setHasDrawn(true);

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;

    const { x, y } = getPointer(e);
    lastPointRef.current = { x, y };
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [lineColor, lineWidth]);

  // Gambar coretan
  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPointer(e);

    const last = lastPointRef.current;
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      if (Math.hypot(dx, dy) < 1) return;
    }
    lastPointRef.current = { x, y };
    ctx.lineTo(x, y);
    ctx.stroke();
  }, []);

  // Selesai gambar
  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
  }, []);

  // Hapus canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    setHasDrawn(false);
    lastPointRef.current = null;
    isDrawingRef.current = false;

    if (debugMode) {
      drawTemplateOnUserCanvas(ctx, target, width, height);
    }
  }, [width, height, target, debugMode]);

  // Validasi coretan berdasarkan match ratio saja
  const compareToTarget = useCallback(() => {
    if (!hasDrawn) return false;
    const canvas = canvasRef.current;
    const tpl = templateCanvasRef.current;
    if (!canvas || !tpl) return false;

    const w = canvas.width;
    const h = canvas.height;
    const uCtx = canvas.getContext('2d');
    uCtx.setTransform(1, 0, 0, 1, 0, 0);
    const userData = uCtx.getImageData(0, 0, w, h).data;

    const tCtx = tpl.getContext('2d');
    tCtx.setTransform(1, 0, 0, 1, 0, 0);
    const tplData = tCtx.getImageData(0, 0, w, h).data;

    let match = 0;
    let tplCount = 0;
    for (let i = 0; i < userData.length; i += 4) {
      if (tplData[i + 3] > 30) {
        tplCount++;
        const r = userData[i], g = userData[i+1], b = userData[i+2];
        const isDrawn = (r < 240 || g < 240 || b < 240);
        if (isDrawn) match++;
      }
    }

    const matchRatio = match / tplCount;
    console.log('Debug Info:');
    console.log('Target:', target);
    console.log('Match ratio:', matchRatio.toFixed(2));
    console.log('Template pixels:', tplCount);
    console.log('Matched pixels:', match);

    // Accept if match ratio >= 8%
    return matchRatio >= 0.08;
  }, [hasDrawn, target]);

  return {
    canvasRef,
    hasDrawn,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    compareToTarget,
    debugMode,
    toggleDebugMode
  };
}
