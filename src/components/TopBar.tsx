import type { IntroPhase, NavCommand, SlideId } from '../utils/presentation';

interface TopBarProps {
  currentSlide: SlideId;
  introPhase: IntroPhase;
  introRunId: number;
  onCommand: (command: NavCommand) => void;
  onOpenOutline: (trigger: HTMLElement) => void;
}

export function TopBar({
  currentSlide,
  introPhase,
  introRunId,
  onCommand,
  onOpenOutline,
}: TopBarProps) {
  const isPlaying = introPhase === 'playing';
  const isCover = currentSlide === 'accueil';

  const pillBase =
    'focus-ring inline-flex items-center justify-center rounded-full whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer select-none';

  const getCenterButtonClass = (active: boolean) =>
    `${pillBase} px-5 h-[40px] text-[14.5px] font-medium tracking-[-0.01em] ${
      active
        ? 'bg-white text-[#141110] shadow-[0_6px_22px_rgba(0,0,0,0.22)]'
        : 'bg-black/26 text-white/90 border border-white/14 backdrop-blur-sm hover:bg-black/38 hover:text-white'
    }`;

  return (
    <header className="relative md:absolute md:inset-x-0 md:top-0 z-30 w-full">
      {/* Desktop 16:9 / widescreen header matching exact reference landmarks */}
      <div className="hidden md:block">
        {/* Top pill bar aligned at ~2.9% from top */}
        <div
          key={`topbar-row-${introRunId}`}
          className="relative flex items-center justify-end px-[6.2%] pt-[2.85vh]"
        >
          {/* Top-center primary navigation: Accueil, Stratégie, Récit */}
          <nav
            aria-label="Navigation principale"
            className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-3 ${
              isPlaying ? 'anim-top-nav' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => onCommand('accueil')}
              aria-current={currentSlide === 'accueil' ? 'page' : undefined}
              className={getCenterButtonClass(currentSlide === 'accueil')}
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={() => onCommand('strategie')}
              aria-current={currentSlide === 'attirer' ? 'page' : undefined}
              className={getCenterButtonClass(currentSlide === 'attirer')}
            >
              Stratégie
            </button>
            <button
              type="button"
              onClick={() => onCommand('recit')}
              aria-current={currentSlide === 'engager' ? 'page' : undefined}
              className={getCenterButtonClass(currentSlide === 'engager')}
            >
              Récit
            </button>
          </nav>

          {/* Top-right actions: Voir le plan & Démarrer (Démarrer staggered last) */}
          <div className="flex items-center justify-end gap-3.5 shrink-0">
            <button
              type="button"
              onClick={(e) => onOpenOutline(e.currentTarget)}
              className={`${pillBase} px-5 h-[40px] text-[14.5px] font-medium bg-white/14 text-white/95 border border-white/15 backdrop-blur-sm hover:bg-white/24 ${
                isPlaying ? 'anim-top-plan' : ''
              }`}
            >
              Voir le plan
            </button>
            <button
              type="button"
              onClick={() => onCommand('demarrer')}
              className={`${pillBase} px-7 h-[40px] text-[14.5px] font-medium bg-white text-[#141110] shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-white/92 ${
                isPlaying ? 'anim-top-start' : ''
              }`}
            >
              Démarrer
            </button>
          </div>
        </div>

        {/* White university logos positioned at ~8% left, ~7% top, aligned with cover text */}
        <div
          key={`logos-${introRunId}`}
          className={`pointer-events-auto absolute left-[8%] top-[7vh] z-30 transition-opacity duration-300 ${
            isPlaying ? 'anim-top-logos' : ''
          } ${isCover ? 'opacity-100' : 'opacity-90'}`}
        >
          <button
            type="button"
            onClick={() => onCommand('accueil')}
            aria-label="Retour à l’accueil — Université Mohammed V de Rabat et Faculté des Sciences Juridiques, Économiques et Sociales"
            className="focus-ring block rounded-md bg-transparent p-0.5 transition-opacity hover:opacity-90 cursor-pointer"
          >
            <img
              src="/assets/aistudio/Double_logo_universitaire_blanc_transparent_e7d0b752.png"
              alt="Faculté des Sciences Juridiques, Économiques et Sociales - Souissi — Université Mohammed V de Rabat"
              className="h-auto w-[clamp(165px,13.6vw,252px)] select-none object-contain"
              draggable={false}
            />
          </button>
        </div>
      </div>

      {/* Mobile compact single-row top bar (well under 15% of 844px viewport) */}
      <div
        key={`mobile-topbar-${introRunId}`}
        className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2 md:hidden"
      >
        <button
          type="button"
          onClick={() => onCommand('accueil')}
          aria-label="Retour à l’accueil — Université Mohammed V de Rabat"
          className={`focus-ring shrink-0 rounded-md p-0.5 cursor-pointer ${
            isPlaying ? 'anim-top-logos' : ''
          }`}
        >
          <img
            src="/assets/aistudio/Double_logo_universitaire_blanc_transparent_e7d0b752.png"
            alt="Faculté des Sciences Juridiques, Économiques et Sociales - Souissi — Université Mohammed V de Rabat"
            className="h-9 w-auto object-contain"
            draggable={false}
          />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => onOpenOutline(e.currentTarget)}
            className={`${pillBase} px-3.5 h-[40px] text-[13px] font-medium bg-white/14 text-white border border-white/18 backdrop-blur-sm ${
              isPlaying ? 'anim-top-plan' : ''
            }`}
          >
            Voir le plan
          </button>
          <button
            type="button"
            onClick={() => onCommand('demarrer')}
            className={`${pillBase} px-4 h-[40px] text-[13px] font-medium bg-white text-[#141110] shadow-md ${
              isPlaying ? 'anim-top-start' : ''
            }`}
          >
            Démarrer
          </button>
        </div>
      </div>
    </header>
  );
}
