import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HERO_DISHES, HeroDish } from '../../data/heroDishesData';
import { CinematicAtmosphereCanvas } from './CinematicAtmosphereCanvas';
import { useLanguage } from '../../services/i18n';

const SLIDE_DURATION_MS = 5000; // 5 seconds per dish (within requested 4 to 6 seconds)

export const HeroCinematicCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentDish: HeroDish = HERO_DISHES[currentIndex];

  // Preload next image to ensure zero blink/delay
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % HERO_DISHES.length;
    const img = new Image();
    img.src = HERO_DISHES[nextIndex].posterUrl;
  }, [currentIndex]);

  // Autoplay timer with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_DISHES.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_DISHES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_DISHES.length) % HERO_DISHES.length);
  }, []);

  // Touch handlers for fluid swipe on tablet / mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      handleNext();
    } else if (distance < -40) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative w-full h-full select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrousel vidéo culinaire"
    >
      {/* Visual Slides with Smooth Crossfade */}
      {HERO_DISHES.map((dish, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={dish.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            {/* Cinematic Camera Motion Container */}
            <div
              className="w-full h-full overflow-hidden transition-transform duration-[5000ms] ease-linear"
              style={{
                transformOrigin: dish.motion.transformOrigin,
                transform: isActive
                  ? `scale(${dish.motion.endScale}) translate(${dish.motion.endX}%, ${dish.motion.endY}%)`
                  : `scale(${dish.motion.startScale}) translate(${dish.motion.startX}%, ${dish.motion.startY}%)`,
              }}
            >
              {dish.videoUrl ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={dish.posterUrl}
                  className="w-full h-full object-cover object-center"
                >
                  <source src={dish.videoUrl} type="video/webm" />
                  <img
                    src={dish.posterUrl}
                    alt={dish.title}
                    className="w-full h-full object-cover object-center"
                  />
                </video>
              ) : (
                <img
                  src={dish.posterUrl}
                  alt={dish.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>

            {/* Subtle natural vignette shadow */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        );
      })}

      {/* Realistic subtle steam / embers atmosphere canvas */}
      <CinematicAtmosphereCanvas effect={currentDish.atmosphere} />

      {/* Original Live Atmosphere Badge: ● Cuisine en direct */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAEAEA] text-[11px] font-semibold text-[#0A0A0A] shadow-sm flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#0A0A0A] animate-pulse" />
        <span>{t.liveKitchenBadge}</span>
      </div>

      {/* Discreet Minimalist Carousel Dot Indicator: ● ○ ○ ○ ○ ○ ○ */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-sm"
        role="tablist"
        aria-label="Navigation des vidéos"
      >
        {HERO_DISHES.map((dish, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={dish.id}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 rounded-full focus:outline-none ${
                isActive
                  ? 'w-2 h-2 bg-white scale-125'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              title={`Vidéo ${dish.number} : ${dish.title}`}
              aria-label={`Vidéo ${dish.number} : ${dish.title}`}
              role="tab"
              aria-selected={isActive}
            />
          );
        })}
      </div>
    </div>
  );
};
