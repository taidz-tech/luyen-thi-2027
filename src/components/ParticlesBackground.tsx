import React, { useEffect, useRef } from 'react';

export const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      alphaDelta: number;
      color: string;
    }

    const colors = [
      'rgba(245, 158, 11, ', // Golden amber
      'rgba(56, 189, 248, ', // Sky blue
      'rgba(168, 85, 247, ', // Purple
      'rgba(251, 191, 36, ', // Bright gold
    ];

    const particleCount = Math.min(65, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.45 - 0.1, // float upward
        alpha: Math.random() * 0.7 + 0.2,
        alphaDelta: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle radial backdrop glow
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.2,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      grad.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.85)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw and update particles
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += p.alphaDelta;

        if (p.alpha > 0.85 || p.alpha < 0.15) {
          p.alphaDelta = -p.alphaDelta;
        }

        // Wrap around screen edges
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color + '0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.92 }}
    />
  );
};
