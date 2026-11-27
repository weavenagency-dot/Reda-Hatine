import { useId } from 'react';
import type { IntroPhase, ViewportVisorAnchor } from '../utils/presentation';

interface IntroCurtainProps {
  introPhase: IntroPhase;
  introRunId: number;
  visorAnchor: ViewportVisorAnchor;
  viewportSize: { w: number; h: number };
  onLaunch: () => void;
}

export function IntroCurtain({
  introPhase,
  introRunId,
  visorAnchor,
  viewportSize,
  onLaunch,
}: IntroCurtainProps) {
  const maskId = useId();

  if (introPhase === 'complete') {
    return null;
  }

  // Initial state: 100% pure #000000 interactive full-screen launch surface
  if (introPhase === 'waiting') {
    return (
      <button
        type="button"
        data-testid="launch-curtain"
        aria-label="Lancer la présentation"
        onClick={onLaunch}
        className="fixed inset-0 z-50 h-full w-full cursor-pointer border-0 bg-[#000000] p-0 m-0 appearance-none focus:outline-none focus-visible:outline-2 focus-visible:outline-white/75 focus-visible:-outline-offset-4"
      />
    );
  }

  // Playing state (0–650 ms):
  // - Soft-feathered SVG #000000 veil opening along the diagonal visor ray (180–650 ms)
  // - Warm-white visor glow (0–180 ms) -> diagonal prismatic beam stretch (180–650 ms)
  // Strictly below typography/controls (z-[18]) so 540–1800 ms text enters cleanly on top.
  const vw = Math.max(viewportSize.w, 1);
  const vh = Math.max(viewportSize.h, 1);
  const vx = visorAnchor.x;
  const vy = visorAnchor.y;
  const maxR = Math.max(visorAnchor.maxCornerDistance, Math.hypot(vw, vh));
  const sparkSize = Math.round(Math.max(76, visorAnchor.renderedWidth * 0.135));
  const rayLength = Math.round(Math.max(220, visorAnchor.renderedWidth * 0.44));
  const rayHeight = Math.round(Math.max(54, visorAnchor.renderedWidth * 0.088));

  const rayMaskId = `${maskId}-ray-grad`;
  const radialMaskId = `${maskId}-radial-grad`;
  const fullMaskId = `${maskId}-veil-mask`;

  return (
    <div
      key={`curtain-play-${introRunId}`}
      data-testid="intro-opening-curtain"
      data-visor-x={Math.round(vx)}
      data-visor-y={Math.round(vy)}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[18] overflow-hidden"
    >
      {/* Pure #000000 black veil with soft feathered mask opening from the visor */}
      <svg
        className="anim-curtain-veil absolute inset-0 h-full w-full"
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id={rayMaskId} cx="28%" cy="50%" r="72%">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="42%" stopColor="#000000" stopOpacity="0.94" />
            <stop offset="76%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={radialMaskId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="48%" stopColor="#000000" stopOpacity="0.92" />
            <stop offset="78%" stopColor="#000000" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <mask id={fullMaskId}>
            {/* White keeps the #000000 black veil opaque */}
            <rect x="0" y="0" width={vw} height={vh} fill="#ffffff" />

            {/* 180–520 ms: Diagonal ray aperture opening first from visor toward bottom-left */}
            <g transform={`translate(${vx} ${vy})`}>
              <ellipse
                cx={rayLength * 0.42}
                cy="0"
                rx={rayLength * 0.72}
                ry={rayHeight * 1.15}
                fill={`url(#${rayMaskId})`}
                className="anim-mask-ray"
                style={{ transformOrigin: '0px 0px' }}
              />
            </g>

            {/* 210–650 ms: Soft radial aperture revealing glasses -> face -> full crimson backdrop */}
            <g transform={`translate(${vx} ${vy})`}>
              <circle
                cx="0"
                cy="0"
                r={maxR}
                fill={`url(#${radialMaskId})`}
                className="anim-mask-radial"
                style={{ transformOrigin: '0px 0px' }}
              />
            </g>
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width={vw}
          height={vh}
          fill="#000000"
          mask={`url(#${fullMaskId})`}
        />
      </svg>

      {/* 0–180 ms: Small warm-white glow igniting in the black at exact visor coordinates */}
      <div
        data-testid="visor-spark-glow"
        className="anim-curtain-spark absolute rounded-full mix-blend-screen"
        style={{
          left: `${vx}px`,
          top: `${vy}px`,
          width: `${sparkSize}px`,
          height: `${Math.round(sparkSize * 0.74)}px`,
          background:
            'radial-gradient(ellipse at center, rgba(255,253,246,1) 0%, rgba(255,238,205,0.88) 28%, rgba(255,178,86,0.42) 56%, rgba(220,76,34,0) 80%)',
          filter: 'blur(5px)',
        }}
      />

      {/* 180–650 ms: Diagonal warm-white + amber + prismatic reflection stretching bottom-left */}
      <div
        data-testid="visor-opening-ray"
        className="anim-curtain-ray absolute mix-blend-screen"
        style={{
          left: `${vx}px`,
          top: `${vy}px`,
          width: `${rayLength}px`,
          height: `${rayHeight}px`,
          transformOrigin: '0% 50%',
        }}
      >
        {/* Subtle prismatic spectral fringe */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(120,210,255,0) 4%, rgba(135,214,255,0.32) 22%, rgba(255,198,92,0.56) 48%, rgba(255,112,150,0.36) 74%, rgba(255,90,90,0) 96%)',
            maskImage:
              'linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.78) 46%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.78) 46%, rgba(0,0,0,0) 100%)',
            filter: 'blur(9px)',
          }}
        />
        {/* Warm amber halo */}
        <div
          className="absolute inset-x-0 top-[20%] bottom-[20%]"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,226,164,0.94) 0%, rgba(255,170,70,0.72) 40%, rgba(235,88,42,0.18) 78%, rgba(235,88,42,0) 100%)',
            filter: 'blur(6px)',
          }}
        />
        {/* Warm-white core */}
        <div
          className="absolute inset-x-0 top-[36%] bottom-[36%]"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,253,245,0.98) 0%, rgba(255,244,218,0.86) 32%, rgba(255,214,148,0.2) 70%, rgba(255,214,148,0) 100%)',
            filter: 'blur(2.5px)',
          }}
        />
      </div>
    </div>
  );
}
