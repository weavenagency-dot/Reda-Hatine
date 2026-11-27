import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { METHOD_SLIDES } from '../data/slides';
import { StepRail } from './StepRail';
import type { SlideId } from '../utils/presentation';

interface SlideScreenProps {
  slideId: Exclude<SlideId, 'accueil'>;
  transitionKey: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectStep: (step: 'attirer' | 'engager' | 'convertir') => void;
  onOpenAgent: (trigger: HTMLElement) => void;
}

export function SlideScreen({
  slideId,
  transitionKey,
  onPrev,
  onNext,
  onSelectStep,
  onOpenAgent,
}: SlideScreenProps) {
  const slide = METHOD_SLIDES[slideId];
  const isLast = slideId === 'convertir';

  return (
    <section
      key={`${slideId}-${transitionKey}`}
      aria-labelledby="slide-heading"
      className="relative z-20 flex-1 w-full flex flex-col justify-between px-5 pt-4 pb-8 md:pl-[8.2%] md:pr-[16.5%] md:pt-[max(138px,17vh)] md:pb-[5vh] overflow-y-auto md:overflow-hidden"
    >
      {/* Main editorial two-column composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start my-auto">
        {/* Left column: Method & 3 concise points */}
        <div className="lg:col-span-7 space-y-5 lg:space-y-6">
          <div className="space-y-3 anim-slide-title">
            <p className="text-[13px] font-medium tracking-[0.02em] text-white/75">
              {slide.kicker}
            </p>
            <h1
              id="slide-heading"
              className="font-medium tracking-[-0.025em] text-white text-[clamp(1.85rem,3.05vw,3.25rem)] leading-[1.08] [text-wrap:balance]"
            >
              {slide.title}
            </h1>
            <p className="max-w-2xl text-[clamp(0.98rem,1.18vw,1.18rem)] leading-[1.52] text-white/88">
              {slide.mainIdea}
            </p>
          </div>

          {/* Three concise pillars separated by subtle hairlines */}
          <ol className="anim-slide-body divide-y divide-white/12 border-t border-b border-white/12">
            {slide.points.map((point) => (
              <li
                key={point.number}
                className="grid grid-cols-[2.25rem_1fr] gap-3 py-3.5 lg:py-4 items-baseline"
              >
                <span className="text-[13px] font-medium tabular-nums text-white/60">
                  {point.number}.
                </span>
                <div className="space-y-1">
                  <h2 className="text-[16px] lg:text-[17px] font-medium text-white leading-snug">
                    {point.title}
                  </h2>
                  <p className="text-[14px] lg:text-[14.5px] leading-[1.5] text-white/80">
                    {point.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Right column: Consistent Maison Solis case study */}
        <aside
          aria-label={`Exemple concret — ${slide.example.brand}`}
          className="lg:col-span-5 anim-slide-body rounded-2xl bg-[#290907]/75 border border-white/15 p-5 sm:p-6 lg:p-7 backdrop-blur-md"
        >
          <div className="space-y-1 pb-4 border-b border-white/12">
            <p className="text-[12.5px] font-medium text-white/68">
              {slide.example.context}
            </p>
            <h2 className="text-[20px] lg:text-[22px] font-medium tracking-[-0.015em] text-white">
              Exemple : {slide.example.brand}
            </h2>
          </div>

          <dl className="mt-4 space-y-4">
            {slide.example.items.map((item) => (
              <div key={item.label} className="space-y-1">
                <dt className="text-[12.5px] font-medium text-amber-200/90">
                  {item.label}
                </dt>
                <dd className="text-[14.5px] leading-[1.52] text-white/92">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {/* Bottom bar: Gemini Agent CTA + Prev/Next slide controls */}
      <div className="mt-7 lg:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/12">
        <button
          type="button"
          onClick={(e) => onOpenAgent(e.currentTarget)}
          className="focus-ring inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 h-[44px] text-[14.5px] font-medium text-[#151110] shadow-[0_8px_28px_rgba(0,0,0,0.28)] hover:bg-white/92 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-[#B61C19]" aria-hidden="true" />
          <span>Adapter à mon projet</span>
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-white/12 border border-white/16 px-4 h-[42px] text-[13.5px] font-medium text-white/92 hover:bg-white/22 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Précédent</span>
          </button>

          <span className="text-[13px] font-medium tabular-nums text-white/75 px-1">
            {slide.stepNumber} / 03
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className={`focus-ring inline-flex items-center gap-2 rounded-full px-4 h-[42px] text-[13.5px] font-medium whitespace-nowrap shrink-0 transition-colors ${
              isLast
                ? 'bg-white/8 text-white/40 border border-white/10 cursor-not-allowed'
                : 'bg-white/16 border border-white/20 text-white hover:bg-white/26 cursor-pointer'
            }`}
          >
            <span>Suivant</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile step navigation below content */}
      <div className="mt-5 md:hidden">
        <StepRail
          currentSlide={slideId}
          introPhase="complete"
          introRunId={0}
          onSelectStep={onSelectStep}
          variant="mobile"
        />
      </div>
    </section>
  );
}
