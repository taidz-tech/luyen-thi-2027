import React, { useEffect, useRef } from 'react';

interface FireworksProps {
  durationMs?: number;
  onFinish?: () => void;
}

export const Fireworks: React.FC<FireworksProps> = ({ durationMs = 5000, onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      gravity: number;
    }

    const sparks: Spark[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#38bdf8', '#a855f7', '#ec4899', '#10b981', '#ffffff'];

    const createBurst = (x: number, y: number) => {
      const count = 45 + Math.floor(Math.random() * 30);
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: Math.random() > 0.4 ? baseColor : colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 1.5,
          gravity: 0.12,
        });
      }
    };

    // Periodic bursts
    let intervalId = setInterval(() => {
      createBurst(
        width * 0.2 + Math.random() * width * 0.6,
        height * 0.15 + Math.random() * height * 0.4
      );
    }, 450);

    createBurst(width * 0.5, height * 0.3);

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += s.gravity;
        s.vx *= 0.98;
        s.alpha -= 0.016;

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, [durationMs, onFinish]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
