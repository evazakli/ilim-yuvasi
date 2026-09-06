import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  color: string;
}

const BUBBLE_COLORS = ['#4a4a4a', '#5a5a5a', '#3a3a3a', '#4f4f4f', '#404040'];

export const FloatingBubbles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 20 floating particles matching Python version
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 20 + 6,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)]
      });
    }

    let lastTime = performance.now();
    const frameInterval = 45; // ~22 FPS to save CPU matching Python desktop optimization

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      if (time - lastTime < frameInterval) return;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (const b of bubbles) {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x - b.r < 0 || b.x + b.r > width) b.dx *= -1;
        if (b.y - b.r < 0 || b.y + b.r > height) b.dy *= -1;

        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
