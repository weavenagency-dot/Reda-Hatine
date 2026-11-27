import { useEffect, useRef } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { OUTLINE_SCREENS } from '../data/slides';
import type { SlideId } from '../utils/presentation';

interface OutlineModalProps {
  isOpen: boolean;
  currentSlide: SlideId;
  onClose: () => void;
  onSelectSlide: (slide: SlideId) => void;
  onReplayIntro: () => void;
}

export function OutlineModal({
  isOpen,
  currentSlide,
  onClose,
  onSelectSlide,
  onReplayIntro,
}: OutlineModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1F0605]/78 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="outline-modal-title"
        className="w-full max-w-xl rounded-3xl bg-[#320B08] border border-white/16 shadow-[0_28px_80px_rgba(0,0,0,0.55)] overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-white/12">
          <div>
            <p className="text-[12.5px] font-medium text-white/65">
              Marketing digital & storytelling
            </p>
            <h2
              id="outline-modal-title"
              className="mt-0.5 text-[22px] font-medium tracking-[-0.015em] text-white"
            >
              Plan de la présentation
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer le plan"
            className="focus-ring inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/12 text-white hover:bg-white/22 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Écrans de la présentation" className="p-4 sm:p-5 space-y-2">
          {OUTLINE_SCREENS.map((screen) => {
            const isCurrent = screen.id === currentSlide;
            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => onSelectSlide(screen.id)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`focus-ring w-full text-left flex items-start gap-4 rounded-2xl px-4 py-3.5 transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-white text-[#171110]'
                    : 'bg-white/6 text-white hover:bg-white/14 border border-white/10'
                }`}
              >
                <span
                  className={`mt-0.5 text-[13px] font-medium tabular-nums ${
                    isCurrent ? 'text-[#971D15]' : 'text-white/55'
                  }`}
                >
                  {screen.index}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[16px] font-medium leading-snug">
                    {screen.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[13.5px] leading-snug ${
                      isCurrent ? 'text-[#4A3836]' : 'text-white/75'
                    }`}
                  >
                    {screen.subtitle}
                  </span>
                </span>
                {isCurrent && (
                  <span className="self-center text-[12px] font-medium text-[#971D15] whitespace-nowrap">
                    En cours
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-black/22 border-t border-white/12">
          <p className="text-[12.5px] text-white/68">
            Astuce : utilisez les flèches ← et → pour parcourir les diapositives.
          </p>

          <button
            type="button"
            onClick={onReplayIntro}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-white/14 border border-white/18 px-4 h-[40px] text-[13.5px] font-medium text-white hover:bg-white/24 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Rejouer l’intro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
