import React, { useEffect, useRef } from 'react';

interface AnalogClockProps {
  remainingSeconds: number;
  totalSeconds: number;
  size?: number;
  bgColor?: string;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  remainingSeconds,
  totalSeconds,
  size = 240,
  bgColor = '#1E1E2E'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = size;
    const height = size;
    const cx = width / 2;
    const cy = height / 2;
    const radius = cx - 12;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer white clock rim matching Python desktop version
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
    ctx.stroke();

    // 12 Hour Ticks (Python: a = i * 30 * pi / 180; 104 to 117)
    const scale = (radius - 2) / 125;
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const x1 = cx + (104 * scale) * Math.sin(angle);
      const y1 = cy - (104 * scale) * Math.cos(angle);
      const x2 = cx + (117 * scale) * Math.sin(angle);
      const y2 = cy - (117 * scale) * Math.cos(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Calculate minute and second based on remaining time
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    // Minute Hand (Python: fill="#59A5CF", width=3, length=91)
    const minAngle = ((minutes % 60) + seconds / 60) * 6 * (Math.PI / 180);
    const minX = cx + (91 * scale) * Math.sin(minAngle);
    const minY = cy - (91 * scale) * Math.cos(minAngle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(minX, minY);
    ctx.strokeStyle = '#59A5CF';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Second Hand (Python: fill="red", width=1, length=110)
    const secAngle = seconds * 6 * (Math.PI / 180);
    const secX = cx + (108 * scale) * Math.sin(secAngle);
    const secY = cy - (108 * scale) * Math.cos(secAngle);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(secX, secY);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center pivot circle (Python: fill="#59A5CF", radius=4)
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#59A5CF';
    ctx.fill();
  }, [remainingSeconds, totalSeconds, size, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="mx-auto select-none rounded-full shadow-lg"
    />
  );
};
