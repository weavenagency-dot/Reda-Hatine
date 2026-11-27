import { useCallback, useEffect, useRef, useState } from 'react';
import { CampaignAgentPanel } from './components/CampaignAgentPanel';
import { CoverScreen } from './components/CoverScreen';
import { IntroCurtain } from './components/IntroCurtain';
import { OutlineModal } from './components/OutlineModal';
import { PORTRAIT_SRC, PortraitStage } from './components/PortraitStage';
import { SlideScreen } from './components/SlideScreen';
import { StepRail } from './components/StepRail';
import { TopBar } from './components/TopBar';
import {
  getNextSlide,
  getPrevSlide,
  resolveCommandTarget,
  triggerPresentationLaunch,
  type IntroPhase,
  type NavCommand,
  type SlideId,
  type ViewportVisorAnchor,
} from './utils/presentation';

const INTRO_DURATION_MS = 1800;
const LOGO_SRC =
  '/assets/aistudio/Double_logo_universitaire_blanc_transparent_e7d0b752.png';

function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isAutostartRequested(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('autostart') === '1';
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

function getInitialViewport(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 1920, h: 1080 };
  return { w: window.innerWidth, h: window.innerHeight };
}

export default function App() {
  const autostart = isAutostartRequested();

  const [currentSlide, setCurrentSlide] = useState<SlideId>('accueil');
  const [introPhase, setIntroPhase] = useState<IntroPhase>(
    autostart ? 'complete' : 'waiting',
  );
  const [introRunId, setIntroRunId] = useState(1);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  const [viewportSize, setViewportSize] = useState(getInitialViewport);
  const [desktopVisorAnchor, setDesktopVisorAnchor] =
    useState<ViewportVisorAnchor>(() => {
      const vp = getInitialViewport();
      return {
        x: vp.w * 0.47,
        y: vp.h * 0.46,
        renderedWidth: vp.w,
        maxCornerDistance: Math.hypot(vp.w, vp.h),
      };
    });
  const [mobileVisorAnchor, setMobileVisorAnchor] =
    useState<ViewportVisorAnchor>(() => {
      const vp = getInitialViewport();
      return {
        x: vp.w * 0.47,
        y: 175,
        renderedWidth: Math.max(vp.w, 420),
        maxCornerDistance: Math.hypot(vp.w, vp.h),
      };
    });

  const [outlineOpen, setOutlineOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const introTimerRef = useRef<number | null>(null);
  const introPhaseRef = useRef<IntroPhase>(introPhase);
  const outlineTriggerRef = useRef<HTMLElement | null>(null);
  const agentTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    introPhaseRef.current = introPhase;
  }, [introPhase]);

  useEffect(() => {
    const onResize = () => {
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const clearIntroTimer = useCallback(() => {
    if (introTimerRef.current !== null) {
      window.clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
  }, []);

  const startOpeningPlayback = useCallback(() => {
    clearIntroTimer();
    if (isReducedMotionPreferred()) {
      introPhaseRef.current = 'complete';
      setIntroPhase('complete');
      return;
    }
    introPhaseRef.current = 'playing';
    setIntroRunId((n) => n + 1);
    setIntroPhase('playing');
    introTimerRef.current = window.setTimeout(() => {
      introPhaseRef.current = 'complete';
      setIntroPhase('complete');
      introTimerRef.current = null;
    }, INTRO_DURATION_MS);
  }, [clearIntroTimer]);

  // First click/touch/Enter/Space launches the presentation; locked during playback & complete
  const handleLaunchPresentation = useCallback(() => {
    const nextPhase = triggerPresentationLaunch(
      introPhaseRef.current,
      isReducedMotionPreferred(),
    );
    if (nextPhase === introPhaseRef.current) {
      return;
    }
    if (nextPhase === 'complete') {
      clearIntroTimer();
      introPhaseRef.current = 'complete';
      setIntroPhase('complete');
      return;
    }
    startOpeningPlayback();
  }, [clearIntroTimer, startOpeningPlayback]);

  // Preload cover portrait & university logo silently in the background
  useEffect(() => {
    let active = true;
    const portraitImg = new Image();
    portraitImg.onload = () => {
      if (!active) return;
      setImageReady(true);
      setImageError(false);
    };
    portraitImg.onerror = () => {
      if (!active) return;
      setImageError(true);
    };
    portraitImg.src = PORTRAIT_SRC;

    const logoImg = new Image();
    logoImg.src = LOGO_SRC;

    return () => {
      active = false;
      clearIntroTimer();
    };
  }, [clearIntroTimer]);

  // Listen for OS prefers-reduced-motion changes while playing
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches && introPhaseRef.current === 'playing') {
        clearIntroTimer();
        introPhaseRef.current = 'complete';
        setIntroPhase('complete');
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [clearIntroTimer]);

  const navigateTo = useCallback(
    (target: SlideId) => {
      clearIntroTimer();
      introPhaseRef.current = 'complete';
      setIntroPhase('complete');
      setCurrentSlide((prev) => {
        if (prev !== target) {
          setTransitionKey((k) => k + 1);
        }
        return target;
      });
    },
    [clearIntroTimer],
  );

  const handleCommand = useCallback(
    (command: NavCommand) => {
      navigateTo(resolveCommandTarget(command));
    },
    [navigateTo],
  );

  const handleOpenOutline = useCallback(
    (trigger: HTMLElement) => {
      clearIntroTimer();
      introPhaseRef.current = 'complete';
      setIntroPhase('complete');
      outlineTriggerRef.current = trigger;
      setAgentOpen(false);
      setOutlineOpen(true);
    },
    [clearIntroTimer],
  );

  const handleCloseOutline = useCallback(() => {
    setOutlineOpen(false);
    window.requestAnimationFrame(() => {
      outlineTriggerRef.current?.focus();
    });
  }, []);

  const handleOpenAgent = useCallback((trigger: HTMLElement) => {
    agentTriggerRef.current = trigger;
    setOutlineOpen(false);
    setAgentOpen(true);
  }, []);

  const handleCloseAgent = useCallback(() => {
    setAgentOpen(false);
    window.requestAnimationFrame(() => {
      agentTriggerRef.current?.focus();
    });
  }, []);

  const handleReplayIntro = useCallback(() => {
    setOutlineOpen(false);
    setAgentOpen(false);
    setCurrentSlide('accueil');
    setTransitionKey(0);
    startOpeningPlayback();
  }, [startOpeningPlayback]);

  // Global keyboard shortcuts:
  // - While waiting on pure black screen: Enter or Space launches the presentation.
  // - While playing: Enter/Space are locked so repeated presses never restart the intro;
  //   navigation keys (Tab / Arrows) can settle the cover immediately.
  // - Escape closes Outline or Gemini Agent panel and restores focus.
  // - Left / Right arrows navigate between slides outside form fields once revealed.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (introPhaseRef.current === 'waiting') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleLaunchPresentation();
        }
        return;
      }

      if (introPhaseRef.current === 'playing') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          return;
        }
        if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          clearIntroTimer();
          introPhaseRef.current = 'complete';
          setIntroPhase('complete');
        }
        return;
      }

      if (e.key === 'Escape') {
        if (agentOpen) {
          e.preventDefault();
          handleCloseAgent();
          return;
        }
        if (outlineOpen) {
          e.preventDefault();
          handleCloseOutline();
          return;
        }
      }

      if (outlineOpen || agentOpen || isEditableTarget(e.target)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateTo(getNextSlide(currentSlide));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateTo(getPrevSlide(currentSlide));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    agentOpen,
    clearIntroTimer,
    currentSlide,
    handleCloseAgent,
    handleCloseOutline,
    handleLaunchPresentation,
    navigateTo,
    outlineOpen,
  ]);

  const isCover = currentSlide === 'accueil';
  const isWaiting = introPhase === 'waiting';
  const isMobileViewport = viewportSize.w < 768;
  const activeVisorAnchor = isMobileViewport
    ? mobileVisorAnchor
    : desktopVisorAnchor;

  return (
    <div
      data-slide={currentSlide}
      data-intro-phase={introPhase}
      data-intro-run={introRunId}
      className={`relative min-h-dvh md:h-dvh w-full md:overflow-hidden text-white flex flex-col ${
        isWaiting ? 'bg-[#000000] overflow-hidden h-dvh' : 'bg-[#5E1D18]'
      }`}
    >
      {/* Underlying presentation stage (inert & hidden from AT while pure-black curtain awaits launch) */}
      <div
        aria-hidden={isWaiting || undefined}
        inert={isWaiting || undefined}
        className="relative flex-1 flex flex-col min-h-0"
      >
        {/* Full-bleed desktop portrait backdrop */}
        <div className="hidden md:block">
          <PortraitStage
            introPhase={introPhase}
            introRunId={introRunId}
            imageReady={imageReady}
            imageError={imageError}
            isCover={isCover}
            transitionKey={transitionKey}
            variant="desktop"
            onVisorAnchor={setDesktopVisorAnchor}
          />
        </div>

        {/* Mobile sampled crimson atmospheric backdrop */}
        <div
          className="pointer-events-none fixed inset-0 md:hidden"
          style={{
            background:
              'radial-gradient(90% 60% at 50% 18%, #A61C16 0%, #6E1A14 55%, #4A120E 100%)',
          }}
          aria-hidden="true"
        />

        {/* Persistent Top Bar (logos + Accueil / Stratégie / Récit + Voir le plan / Démarrer) */}
        <TopBar
          currentSlide={currentSlide}
          introPhase={introPhase}
          introRunId={introRunId}
          onCommand={handleCommand}
          onOpenOutline={handleOpenOutline}
        />

        {/* Active Screen */}
        <main className="relative z-20 flex-1 flex flex-col min-h-0">
          {isCover ? (
            <CoverScreen
              currentSlide={currentSlide}
              introPhase={introPhase}
              introRunId={introRunId}
              imageReady={imageReady}
              imageError={imageError}
              transitionKey={transitionKey}
              onSelectStep={(step) => navigateTo(step)}
              onMobileVisorAnchor={setMobileVisorAnchor}
            />
          ) : (
            <SlideScreen
              slideId={currentSlide}
              transitionKey={transitionKey}
              onPrev={() => navigateTo(getPrevSlide(currentSlide))}
              onNext={() => navigateTo(getNextSlide(currentSlide))}
              onSelectStep={(step) => navigateTo(step)}
              onOpenAgent={handleOpenAgent}
            />
          )}
        </main>

        {/* Desktop right-hand step rail (Attirer, Engager, Convertir) */}
        <StepRail
          currentSlide={currentSlide}
          introPhase={introPhase}
          introRunId={introRunId}
          onSelectStep={(step) => navigateTo(step)}
          variant="desktop"
        />
      </div>

      {/* Pure #000000 clickable launch screen + 0–650 ms visor glow & diagonal ray mask opening */}
      <IntroCurtain
        introPhase={introPhase}
        introRunId={introRunId}
        visorAnchor={activeVisorAnchor}
        viewportSize={viewportSize}
        onLaunch={handleLaunchPresentation}
      />

      {/* Sommaire modal ("Voir le plan") */}
      <OutlineModal
        isOpen={outlineOpen}
        currentSlide={currentSlide}
        onClose={handleCloseOutline}
        onSelectSlide={(slide) => {
          setOutlineOpen(false);
          navigateTo(slide);
        }}
        onReplayIntro={handleReplayIntro}
      />

      {/* Gemini Agent panel ("Adapter à mon projet") */}
      <CampaignAgentPanel isOpen={agentOpen} onClose={handleCloseAgent} />
    </div>
  );
}
