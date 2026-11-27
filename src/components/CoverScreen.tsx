import { COVER_COPY } from '../data/slides';
import { PortraitStage } from './PortraitStage';
import { StepRail } from './StepRail';
import type {
  IntroPhase,
  SlideId,
  ViewportVisorAnchor,
} from '../utils/presentation';

interface CoverScreenProps {
  currentSlide: SlideId;
  introPhase: IntroPhase;
  introRunId: number;
  imageReady: boolean;
  imageError: boolean;
  transitionKey: number;
  onSelectStep: (step: 'attirer' | 'engager' | 'convertir') => void;
  onMobileVisorAnchor?: (anchor: ViewportVisorAnchor) => void;
}

export function CoverScreen({
  currentSlide,
  introPhase,
  introRunId,
  imageReady,
  imageError,
  transitionKey,
  onSelectStep,
  onMobileVisorAnchor,
}: CoverScreenProps) {
  const isPlaying = introPhase === 'playing';

  const paragraphAnimClasses = ['anim-para-1', 'anim-para-2', 'anim-para-3'];

  return (
    <section
      aria-label="Couverture — Marketing digital et storytelling"
      className="relative z-20 flex-1 w-full"
    >
      {/* Desktop 16:9 editorial layout matching exact reference geometry */}
      <div
        key={`cover-desktop-${introRunId}`}
        className="hidden md:block absolute left-[8.2%] top-[36vh] max-w-[38vw]"
      >
        {/* Intro | De l’idée à l’action pill badge at ~36% height */}
        <div
          className={`inline-flex items-center gap-3 rounded-full bg-white/16 border border-white/15 p-1 pr-4 backdrop-blur-[2px] ${
            isPlaying ? 'anim-badge-enter' : ''
          }`}
        >
          <span className="inline-flex items-center justify-center rounded-full bg-white px-3.5 py-1 text-[13.5px] font-medium leading-none text-[#161110]">
            {COVER_COPY.badgeTag}
          </span>
          <span className="text-[13.5px] font-normal tracking-[-0.005em] text-white/95 whitespace-nowrap">
            {COVER_COPY.badgeLabel}
          </span>
        </div>

        {/* Two-line masked title: 560ms & 710ms */}
        <h1 className="mt-[2.6vh] font-medium tracking-[-0.025em] text-white text-[clamp(2.35rem,3.5vw,4.3rem)] leading-[1.08]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span
              className={`block ${isPlaying ? 'anim-title-line-1' : ''}`}
            >
              {COVER_COPY.titleLine1}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span
              className={`block ${isPlaying ? 'anim-title-line-2' : ''}`}
            >
              {COVER_COPY.titleLine2}
            </span>
          </span>
        </h1>

        {/* Three exact lines staggered by 70 ms starting at 940 ms */}
        <div className="mt-[2vh] space-y-0.5 text-[clamp(0.98rem,1.16vw,1.34rem)] font-normal leading-[1.42] tracking-[-0.005em] text-white/92">
          {COVER_COPY.paragraphLines.map((line, index) => (
            <p
              key={line}
              className={isPlaying ? paragraphAnimClasses[index] : ''}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Mobile vertical layout: framed portrait on top, text in middle, 3 steps below */}
      <div
        key={`cover-mobile-${introRunId}`}
        className="flex flex-col gap-5 px-4 pt-2 pb-8 md:hidden"
      >
        <PortraitStage
          introPhase={introPhase}
          introRunId={introRunId}
          imageReady={imageReady}
          imageError={imageError}
          isCover={true}
          transitionKey={transitionKey}
          variant="mobile"
          onVisorAnchor={onMobileVisorAnchor}
        />

        <div className="space-y-4 px-1">
          <div
            className={`inline-flex items-center gap-2.5 rounded-full bg-white/16 border border-white/15 p-1 pr-3.5 ${
              isPlaying ? 'anim-badge-enter' : ''
            }`}
          >
            <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-1 text-[12.5px] font-medium leading-none text-[#161110]">
              {COVER_COPY.badgeTag}
            </span>
            <span className="text-[12.5px] text-white/95">
              {COVER_COPY.badgeLabel}
            </span>
          </div>

          <h1 className="font-medium tracking-[-0.025em] text-white text-[clamp(2rem,9.2vw,2.65rem)] leading-[1.08]">
            <span className="block overflow-hidden pb-[0.05em]">
              <span className={`block ${isPlaying ? 'anim-title-line-1' : ''}`}>
                {COVER_COPY.titleLine1}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span className={`block ${isPlaying ? 'anim-title-line-2' : ''}`}>
                {COVER_COPY.titleLine2}
              </span>
            </span>
          </h1>

          <div className="space-y-1 text-[15.5px] leading-[1.48] text-white/90">
            {COVER_COPY.paragraphLines.map((line, index) => (
              <p
                key={line}
                className={isPlaying ? paragraphAnimClasses[index] : ''}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="pt-1">
          <StepRail
            currentSlide={currentSlide}
            introPhase={introPhase}
            introRunId={introRunId}
            onSelectStep={onSelectStep}
            variant="mobile"
          />
        </div>
      </div>
    </section>
  );
}
