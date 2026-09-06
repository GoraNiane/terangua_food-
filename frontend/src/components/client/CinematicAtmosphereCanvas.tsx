import React, { useEffect, useRef } from 'react';

interface CinematicAtmosphereProps {
  effect: 'steam' | 'embers-smoke' | 'delicate-steam' | 'golden-shimmer';
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  growth: number;
  hue?: number;
}

export const CinematicAtmosphereCanvas: React.FC<CinematicAtmosphereProps> = ({
  effect,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const maxParticles = effect === 'embers-smoke' ? 22 : 16;

    const createParticle = (spawnInitial = false): Particle => {
      const isSteam = effect === 'steam' || effect === 'delicate-steam';
      const isEmbers = effect === 'embers-smoke';

      if (isEmbers && Math.random() > 0.45) {
        // Glowing ember spark
        const maxLife = 120 + Math.random() * 80;
        return {
          x: width * 0.25 + Math.random() * (width * 0.55),
          y: spawnInitial ? height * 0.3 + Math.random() * (height * 0.6) : height * 0.75 + Math.random() * (height * 0.2),
          vx: (Math.random() - 0.48) * 0.6,
          vy: -(0.5 + Math.random() * 0.8),
          radius: 0.8 + Math.random() * 1.5,
          alpha: 0,
          maxAlpha: 0.4 + Math.random() * 0.45,
          life: spawnInitial ? Math.random() * maxLife : 0,
          maxLife,
          growth: -0.003,
          hue: 25 + Math.random() * 20, // Warm amber/gold glow
        };
      }

      // Steam or subtle smoke plume
      const maxLife = isSteam ? 160 + Math.random() * 100 : 180 + Math.random() * 120;
      return {
        x: width * 0.3 + Math.random() * (width * 0.45),
        y: spawnInitial ? height * 0.2 + Math.random() * (height * 0.7) : height * 0.7 + Math.random() * (height * 0.25),
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(0.35 + Math.random() * 0.45),
        radius: isSteam ? 18 + Math.random() * 28 : 22 + Math.random() * 32,
        alpha: 0,
        maxAlpha: effect === 'delicate-steam' ? 0.08 : 0.14,
        life: spawnInitial ? Math.random() * maxLife : 0,
        maxLife,
        growth: 0.18 + Math.random() * 0.15,
      };
    };

    // Prepopulate particles so there's no sudden pop-in
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Calculate smooth alpha envelope (fade in, linger, fade out)
        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else if (progress > 0.65) {
          p.alpha = ((1 - progress) / 0.35) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        // Slight harmonic sinusoidal drift
        p.x += p.vx + Math.sin(time + p.life * 0.02) * 0.25;
        p.y += p.vy;
        p.radius = Math.max(0.4, p.radius + p.growth);

        // Draw particle
        if (p.hue !== undefined) {
          // Fire ember spark
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
          ctx.shadowColor = 'rgba(255, 120, 20, 0.6)';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        } else {
          // Soft radial gradient for natural culinary steam
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(1, p.radius));
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 1.2})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${p.alpha * 0.6})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.save();
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Respawn if expired
        if (p.life >= p.maxLife || p.y < -50 || p.x < -50 || p.x > width + 50) {
          particles[i] = createParticle(false);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [effect]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-10 w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
};
