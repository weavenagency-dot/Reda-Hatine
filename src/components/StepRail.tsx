import type { IntroPhase, SlideId } from '../utils/presentation';

interface StepRailProps {
  currentSlide: SlideId;
  introPhase: IntroPhase;
  introRunId: number;
  onSelectStep: (step: 'attirer' | 'engager' | 'convertir') => void;
  variant: 'desktop' | 'mobile';
}

const STEPS: readonly {
  id: 'attirer' | 'engager' | 'convertir';
  label: string;
  animClass: string;
}[] = [
  { id: 'attirer', label: 'Attirer', animClass: 'anim-rail-1' },
  { id: 'engager', label: 'Engager', animClass: 'anim-rail-2' },
  { id: 'convertir', label: 'Convertir', animClass: 'anim-rail-3' },
];

export function StepRail({
  currentSlide,
  introPhase,
  introRunId,
  onSelectStep,
  variant,
}: StepRailProps) {
  const isPlaying = introPhase === 'playing';
  // On the cover screen, Attirer is highlighted white to match the reference composition
  const highlightedStep = currentSlide === 'accueil' ? 'attirer' : currentSlide;

  if (variant === 'mobile') {
    return (
      <nav
        key={`rail-mobile-${introRunId}`}
        aria-label="Étapes de la méthode"
        className="grid grid-cols-3 gap-2.5 w-full md:hidden"
      >
        {STEPS.map((step) => {
          const isHighlighted = highlightedStep === step.id;
          const isCurrentPage = currentSlide === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              aria-current={isCurrentPage ? 'step' : undefined}
              className={`focus-ring inline-flex items-center justify-center rounded-full min-h-[44px] px-3 text-[14px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isPlaying ? step.animClass : ''
              } ${
                isHighlighted
                  ? 'bg-white text-[#141110] shadow-lg shadow-black/25'
                  : 'bg-white/15 text-white/95 border border-white/16 hover:bg-white/24'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      key={`rail-${introRunId}`}
      aria-label="Étapes de la méthode"
      className="hidden md:flex flex-col items-end gap-2.5 fixed right-[6.2%] top-[41.5%] z-30"
    >
      {STEPS.map((step) => {
        const isHighlighted = highlightedStep === step.id;
        const isCurrentPage = currentSlide === step.id;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onSelectStep(step.id)}
            aria-current={isCurrentPage ? 'step' : undefined}
            className={`focus-ring inline-flex items-center justify-center rounded-full min-w-[104px] h-[40px] px-5 text-[14.5px] font-medium tracking-[-0.01em] whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isPlaying ? step.animClass : ''
            } ${
              isHighlighted
                ? 'bg-white text-[#141110] shadow-[0_8px_24px_rgba(0,0,0,0.22)]'
                : 'bg-white/15 text-white/92 border border-white/14 backdrop-blur-sm hover:bg-white/25 hover:text-white'
            }`}
          >
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
