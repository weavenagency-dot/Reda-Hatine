import { useEffect, useRef, useState } from 'react';
import {
  computeObjectCoverPoint,
  computeViewportVisorAnchor,
  type IntroPhase,
  type ViewportVisorAnchor,
} from '../utils/presentation';

export const PORTRAIT_SRC =
  '/src/assets/images/portrait_clean_backdrop_1795813722872.jpg';

const PORTRAIT_NATURAL_W = 1408;
const PORTRAIT_NATURAL_H = 768;
const VISOR_NORM_X = 0.47;
const VISOR_NORM_Y = 0.46;

interface PortraitStageProps {
  introPhase: IntroPhase;
  introRunId: number;
  imageReady: boolean;
  imageError: boolean;
  isCover: boolean;
  transitionKey: number;
  variant: 'desktop' | 'mobile';
  onVisorAnchor?: (anchor: ViewportVisorAnchor) => void;
}

export function PortraitStage({
  introPhase,
  introRunId,
  imageReady,
  imageError,
  isCover,
  transitionKey,
  variant,
  onVisorAnchor,
}: PortraitStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState({
    w: PORTRAIT_NATURAL_W,
    h: PORTRAIT_NATURAL_H,
  });
  const [boxSize, setBoxSize] = useState({ w: 1920, h: 1080 });

  const objectPosX = variant === 'mobile' ? 0.54 : 0.5;
  const objectPosY = variant === 'mobile' ? 0.36 : 0.5;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateGeometry = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      setBoxSize({ w: rect.width, h: rect.height });
      if (onVisorAnchor) {
        onVisorAnchor(
          computeViewportVisorAnchor(
            {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            },
            window.innerWidth,
            window.innerHeight,
            naturalSize.w,
            naturalSize.h,
            VISOR_NORM_X,
            VISOR_NORM_Y,
            objectPosX,
            objectPosY,
          ),
        );
      }
    };

    updateGeometry();
    const observer = new ResizeObserver(updateGeometry);
    observer.observe(el);
    window.addEventListener('resize', updateGeometry);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateGeometry);
    };
  }, [naturalSize.h, naturalSize.w, objectPosX, objectPosY, onVisorAnchor]);

  const visor = computeObjectCoverPoint(
    boxSize.w,
    boxSize.h,
    naturalSize.w,
    naturalSize.h,
    VISOR_NORM_X,
    VISOR_NORM_Y,
    objectPosX,
    objectPosY,
  );

  const isPlaying = introPhase === 'playing';
  const showPortrait = !imageError && (imageReady || introPhase !== 'waiting');

  return (
    <div
      ref={containerRef}
      data-testid={
        variant === 'mobile' ? 'portrait-stage-mobile' : 'portrait-stage-desktop'
      }
      data-visor-x={Math.round(visor.x)}
      data-visor-y={Math.round(visor.y)}
      className={
        variant === 'desktop'
          ? 'pointer-events-none absolute inset-0 overflow-hidden bg-[#5E1D18]'
          : 'pointer-events-none relative w-full overflow-hidden rounded-2xl bg-[#5E1D18] aspect-[16/10] shadow-2xl shadow-black/40'
      }
      aria-hidden="true"
    >
      {/* Sampled crimson base canvas (visible immediately if image is still loading) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(62% 72% at 54% 48%, #C51E17 0%, #971D15 48%, #681D17 82%, #5E1D18 100%)',
        }}
      />

      {/* Portrait layer with 180–650 ms gentle scale 1.035 -> 1 behind the opening black mask */}
      {showPortrait && (
        <div
          key={`portrait-${introRunId}`}
          className={`absolute inset-0 ${isPlaying ? 'anim-portrait-scale' : ''}`}
        >
          <img
            src={PORTRAIT_SRC}
            alt=""
            referrerPolicy="no-referrer"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
              }
            }}
            className={`h-full w-full object-cover transition-[filter,transform] duration-500 ${
              isCover
                ? 'brightness-100 saturate-100'
                : 'brightness-[0.34] saturate-[0.92] scale-[1.02]'
            }`}
            style={{
              objectPosition: `${objectPosX * 100}% ${objectPosY * 100}%`,
            }}
          />
        </div>
      )}

      {/* Subtle directional vignette on cover & deeper contrast scrim on method slides */}
      <div
        className="absolute inset-0 transition-opacity duration-400"
        style={{
          background: isCover
            ? 'radial-gradient(88% 88% at 55% 48%, rgba(0,0,0,0) 56%, rgba(62,14,11,0.42) 100%)'
            : 'linear-gradient(112deg, rgba(58,13,10,0.88) 0%, rgba(92,19,14,0.72) 55%, rgba(44,10,8,0.84) 100%)',
        }}
      />

      {/* 360 ms diagonal luminous red sweep on slide change (behind content) */}
      {transitionKey > 0 && variant === 'desktop' && (
        <div
          key={`sweep-${transitionKey}`}
          className="anim-slide-sweep absolute inset-y-[-20%] left-0 w-[44%] mix-blend-screen"
          style={{
            background:
              'linear-gradient(90deg, rgba(215,38,28,0) 0%, rgba(238,62,44,0.42) 42%, rgba(255,186,120,0.34) 54%, rgba(197,30,23,0) 100%)',
            filter: 'blur(18px)',
          }}
        />
      )}
    </div>
  );
}
