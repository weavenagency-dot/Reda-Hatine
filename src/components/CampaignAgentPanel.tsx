import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
import {
  parseCampaignResponse,
  validateCampaignInput,
  type CampaignInput,
  type GeneratedCampaign,
} from '../utils/presentation';

interface CampaignAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_FORM: CampaignInput = {
  project: '',
  target: '',
  goal: '',
  channel: '',
};

export function CampaignAgentPanel({ isOpen, onClose }: CampaignAgentPanelProps) {
  const [form, setForm] = useState<CampaignInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'project' | 'target' | 'goal', string>>
  >({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null);
  const [copied, setCopied] = useState(false);

  const firstInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      firstInputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submitGeneration = async () => {
    const validation = validateCampaignInput(form);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    setStatus('loading');

    try {
      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized),
      });

      const data = (await response.json().catch(() => null)) as {
        campaign?: unknown;
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(
          data?.error ||
            'Une erreur est survenue lors de la génération. Vos informations sont conservées : vous pouvez réessayer.',
        );
        return;
      }

      const parsed = parseCampaignResponse(data?.campaign);
      if (!parsed) {
        setStatus('error');
        setErrorMessage(
          'La réponse générée est incomplète. Vos champs sont conservés : cliquez sur Réessayer.',
        );
        return;
      }

      setCampaign(parsed);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage(
        'Connexion interrompue avec le serveur. Vos informations sont conservées : vous pouvez réessayer.',
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitGeneration();
  };

  const handleCopy = async () => {
    if (!campaign) return;
    const summary = [
      `Projet : ${form.project}`,
      '',
      '1. ATTIRER',
      `Accroche : ${campaign.attirer.accroche}`,
      `Format conseillé : ${campaign.attirer.formatConseille}`,
      campaign.attirer.justificationFormat,
      '',
      '2. ENGAGER',
      campaign.engager.recitCourt,
      '',
      '3. CONVERTIR',
      `Appel à l’action : ${campaign.convertir.appelAction}`,
      `Indicateur clé : ${campaign.convertir.indicateurCle}`,
      campaign.convertir.methodeMesure,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const inputBase =
    'focus-ring w-full rounded-xl bg-black/28 border border-white/16 px-3.5 py-2.5 text-[14.5px] text-white placeholder:text-white/42 transition-colors focus:border-white/45';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#1A0504]/72 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-panel-title"
        className="relative flex h-full w-full max-w-2xl flex-col bg-[#2D0A08] border-l border-white/16 shadow-[0_0_80px_rgba(0,0,0,0.65)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/12">
          <div>
            <p className="text-[12.5px] font-medium text-amber-200/88">
              Agent Gemini · Adaptation sur mesure
            </p>
            <h2
              id="agent-panel-title"
              className="mt-0.5 text-[22px] font-medium tracking-[-0.015em] text-white"
            >
              Adapter la méthode à mon projet
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le panneau de l’agent"
            className="focus-ring inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/12 text-white hover:bg-white/22 transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="campaign-project"
                className="block text-[13.5px] font-medium text-white/92"
              >
                Nom ou description du projet <span className="text-amber-300">*</span>
              </label>
              <textarea
                ref={firstInputRef}
                id="campaign-project"
                name="project"
                rows={2}
                required
                value={form.project}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, project: e.target.value }));
                  if (fieldErrors.project) {
                    setFieldErrors((prev) => ({ ...prev, project: undefined }));
                  }
                }}
                placeholder="Ex. Atelier de pâtisserie végétale à Rabat proposant des cours du samedi"
                className={inputBase}
              />
              {fieldErrors.project && (
                <p role="alert" className="text-[12.5px] text-amber-200">
                  {fieldErrors.project}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="campaign-target"
                  className="block text-[13.5px] font-medium text-white/92"
                >
                  Cible <span className="text-amber-300">*</span>
                </label>
                <input
                  id="campaign-target"
                  name="target"
                  type="text"
                  required
                  value={form.target}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, target: e.target.value }));
                    if (fieldErrors.target) {
                      setFieldErrors((prev) => ({ ...prev, target: undefined }));
                    }
                  }}
                  placeholder="Ex. Jeunes actifs curieux de cuisine saine"
                  className={inputBase}
                />
                {fieldErrors.target && (
                  <p role="alert" className="text-[12.5px] text-amber-200">
                    {fieldErrors.target}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="campaign-goal"
                  className="block text-[13.5px] font-medium text-white/92"
                >
                  Objectif <span className="text-amber-300">*</span>
                </label>
                <input
                  id="campaign-goal"
                  name="goal"
                  type="text"
                  required
                  value={form.goal}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, goal: e.target.value }));
                    if (fieldErrors.goal) {
                      setFieldErrors((prev) => ({ ...prev, goal: undefined }));
                    }
                  }}
                  placeholder="Ex. Remplir 12 places chaque week-end"
                  className={inputBase}
                />
                {fieldErrors.goal && (
                  <p role="alert" className="text-[12.5px] text-amber-200">
                    {fieldErrors.goal}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="campaign-channel"
                className="block text-[13.5px] font-medium text-white/85"
              >
                Canal de diffusion{' '}
                <span className="font-normal text-white/55">(facultatif)</span>
              </label>
              <input
                id="campaign-channel"
                name="channel"
                type="text"
                value={form.channel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, channel: e.target.value }))
                }
                placeholder="Ex. Instagram, LinkedIn, TikTok, Newsletter…"
                className={inputBase}
              />
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 h-[44px] text-[14.5px] font-medium text-[#151110] shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:bg-white/92 disabled:opacity-65 disabled:cursor-wait transition-all whitespace-nowrap cursor-pointer"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#971D15]" aria-hidden="true" />
                    <span>Génération en cours…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[#B61C19]" aria-hidden="true" />
                    <span>Générer ma campagne</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Readable loading state */}
          {status === 'loading' && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-white/8 border border-white/14 p-5 space-y-2.5"
            >
              <p className="text-[14.5px] font-medium text-white">
                Construction de votre campagne Attirer · Engager · Convertir…
              </p>
              <p className="text-[13.5px] text-white/75 leading-relaxed">
                L’agent Gemini rédige une accroche adaptée à votre cible, un récit court et un appel à l’action mesurable.
              </p>
            </div>
          )}

          {/* Error state preserving all inputs with Retry */}
          {status === 'error' && (
            <div
              role="alert"
              className="rounded-2xl bg-[#5E1612] border border-amber-300/35 p-5 space-y-3"
            >
              <p className="text-[14.5px] font-medium text-white">
                La génération n’a pas pu aboutir
              </p>
              <p className="text-[13.5px] text-white/85 leading-relaxed">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => void submitGeneration()}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-4 h-[38px] text-[13.5px] font-medium text-[#151110] hover:bg-white/92 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Réessayer</span>
              </button>
            </div>
          )}

          {/* Structured 3-part generated campaign */}
          {campaign && status !== 'loading' && (
            <section
              aria-label="Proposition de campagne générée"
              data-testid="generated-campaign-result"
              className="space-y-4 pt-2 border-t border-white/14"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[16px] font-medium text-white">
                  Votre campagne sur mesure
                </h3>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white/12 border border-white/16 px-3.5 h-[34px] text-[12.5px] font-medium text-white hover:bg-white/22 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-amber-200" aria-hidden="true" />
                      <span>Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copier le plan</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1. Attirer */}
              <article className="rounded-2xl bg-white/8 border border-white/14 p-5 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[16px] font-medium text-white">
                    01. Attirer
                  </h4>
                  <span className="text-[12.5px] text-amber-200/90">
                    Accroche & format
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-medium text-white/60">
                    Accroche prête à publier
                  </p>
                  <p className="text-[15.5px] font-medium leading-snug text-white">
                    « {campaign.attirer.accroche} »
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <p className="text-[12px] font-medium text-white/60">
                    Format conseillé
                  </p>
                  <p className="text-[14.5px] font-medium text-amber-100">
                    {campaign.attirer.formatConseille}
                  </p>
                  {campaign.attirer.justificationFormat && (
                    <p className="text-[13.5px] leading-relaxed text-white/80">
                      {campaign.attirer.justificationFormat}
                    </p>
                  )}
                </div>
              </article>

              {/* 2. Engager */}
              <article className="rounded-2xl bg-white/8 border border-white/14 p-5 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[16px] font-medium text-white">
                    02. Engager
                  </h4>
                  <span className="text-[12.5px] text-amber-200/90">
                    Récit & transformation
                  </span>
                </div>
                <p className="text-[14.5px] leading-[1.6] text-white/94">
                  {campaign.engager.recitCourt}
                </p>
                {(campaign.engager.situation ||
                  campaign.engager.tension ||
                  campaign.engager.transformation) && (
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-white/10 text-[13px]">
                    {campaign.engager.situation && (
                      <div>
                        <dt className="text-white/58 font-medium">Situation</dt>
                        <dd className="mt-0.5 text-white/88 leading-snug">
                          {campaign.engager.situation}
                        </dd>
                      </div>
                    )}
                    {campaign.engager.tension && (
                      <div>
                        <dt className="text-white/58 font-medium">Tension</dt>
                        <dd className="mt-0.5 text-white/88 leading-snug">
                          {campaign.engager.tension}
                        </dd>
                      </div>
                    )}
                    {campaign.engager.transformation && (
                      <div>
                        <dt className="text-white/58 font-medium">Transformation</dt>
                        <dd className="mt-0.5 text-white/88 leading-snug">
                          {campaign.engager.transformation}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </article>

              {/* 3. Convertir */}
              <article className="rounded-2xl bg-white/8 border border-white/14 p-5 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[16px] font-medium text-white">
                    03. Convertir
                  </h4>
                  <span className="text-[12.5px] text-amber-200/90">
                    Action & mesure
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-medium text-white/60">
                    Appel à l’action précis
                  </p>
                  <p className="text-[15.5px] font-medium leading-snug text-white">
                    {campaign.convertir.appelAction}
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <p className="text-[12px] font-medium text-white/60">
                    Indicateur clé recommandé
                  </p>
                  <p className="text-[14.5px] font-medium text-amber-100">
                    {campaign.convertir.indicateurCle}
                  </p>
                  {campaign.convertir.methodeMesure && (
                    <p className="text-[13.5px] leading-relaxed text-white/80">
                      {campaign.convertir.methodeMesure}
                    </p>
                  )}
                </div>
              </article>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
