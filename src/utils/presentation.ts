export type SlideId = 'accueil' | 'attirer' | 'engager' | 'convertir';

export type IntroPhase = 'waiting' | 'playing' | 'complete';

export const SLIDE_ORDER: readonly SlideId[] = [
  'accueil',
  'attirer',
  'engager',
  'convertir',
];

export type NavCommand =
  | 'accueil'
  | 'strategie'
  | 'recit'
  | 'demarrer'
  | 'attirer'
  | 'engager'
  | 'convertir';

export interface ObjectCoverPoint {
  x: number;
  y: number;
  renderedWidth: number;
  renderedHeight: number;
  scale: number;
}

export interface ViewportVisorAnchor {
  x: number;
  y: number;
  renderedWidth: number;
  maxCornerDistance: number;
}

export interface CampaignInput {
  project: string;
  target: string;
  goal: string;
  channel: string;
}

export interface CampaignValidationResult {
  valid: boolean;
  errors: Partial<Record<'project' | 'target' | 'goal', string>>;
  sanitized: CampaignInput;
}

export interface GeneratedCampaign {
  attirer: {
    accroche: string;
    formatConseille: string;
    justificationFormat: string;
  };
  engager: {
    recitCourt: string;
    situation: string;
    tension: string;
    transformation: string;
  };
  convertir: {
    appelAction: string;
    indicateurCle: string;
    methodeMesure: string;
  };
}

/**
 * Resolves the target slide for every header and rail command.
 */
export function resolveCommandTarget(command: NavCommand): SlideId {
  switch (command) {
    case 'accueil':
      return 'accueil';
    case 'strategie':
    case 'demarrer':
    case 'attirer':
      return 'attirer';
    case 'recit':
    case 'engager':
      return 'engager';
    case 'convertir':
      return 'convertir';
  }
}

/**
 * Returns the next slide in the four-screen sequence, clamping at the end.
 */
export function getNextSlide(current: SlideId): SlideId {
  const index = SLIDE_ORDER.indexOf(current);
  if (index === -1 || index >= SLIDE_ORDER.length - 1) {
    return SLIDE_ORDER[SLIDE_ORDER.length - 1];
  }
  return SLIDE_ORDER[index + 1];
}

/**
 * Returns the previous slide in the four-screen sequence, clamping at the start.
 */
export function getPrevSlide(current: SlideId): SlideId {
  const index = SLIDE_ORDER.indexOf(current);
  if (index <= 0) {
    return SLIDE_ORDER[0];
  }
  return SLIDE_ORDER[index - 1];
}

/**
 * Computes the exact viewport coordinates (in container pixels) of a normalized
 * anchor point inside an `object-fit: cover` image so the visor flare stays
 * locked to the glasses across 16:9, 16:10, and mobile portrait crops.
 */
export function computeObjectCoverPoint(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  normX: number,
  normY: number,
  objectPosX = 0.5,
  objectPosY = 0.5,
): ObjectCoverPoint {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    naturalWidth <= 0 ||
    naturalHeight <= 0
  ) {
    return {
      x: containerWidth * normX,
      y: containerHeight * normY,
      renderedWidth: containerWidth,
      renderedHeight: containerHeight,
      scale: 1,
    };
  }

  const scale = Math.max(
    containerWidth / naturalWidth,
    containerHeight / naturalHeight,
  );
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const offsetX = (containerWidth - renderedWidth) * objectPosX;
  const offsetY = (containerHeight - renderedHeight) * objectPosY;

  return {
    x: offsetX + normX * renderedWidth,
    y: offsetY + normY * renderedHeight,
    renderedWidth,
    renderedHeight,
    scale,
  };
}

/**
 * Transitions from the pure-black waiting screen on the first user action,
 * skipping straight to `complete` under reduced motion and locking out
 * double-clicks while the opening transition is already playing or finished.
 */
export function triggerPresentationLaunch(
  currentPhase: IntroPhase,
  reducedMotion: boolean,
): IntroPhase {
  if (currentPhase !== 'waiting') {
    return currentPhase;
  }
  return reducedMotion ? 'complete' : 'playing';
}

/**
 * Computes the visor reflection anchor in viewport CSS pixels (supporting both
 * desktop full-bleed stages and mobile inset portrait frames) plus the distance
 * to the farthest viewport corner so soft reveal masks always clear 100% of the screen.
 */
export function computeViewportVisorAnchor(
  stageRect: { left: number; top: number; width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  normX: number,
  normY: number,
  objectPosX = 0.5,
  objectPosY = 0.5,
): ViewportVisorAnchor {
  const local = computeObjectCoverPoint(
    stageRect.width,
    stageRect.height,
    naturalWidth,
    naturalHeight,
    normX,
    normY,
    objectPosX,
    objectPosY,
  );
  const x = stageRect.left + local.x;
  const y = stageRect.top + local.y;

  const corners = [
    [0, 0],
    [viewportWidth, 0],
    [0, viewportHeight],
    [viewportWidth, viewportHeight],
  ];
  const maxCornerDistance = corners.reduce((maxDist, [cx, cy]) => {
    const dist = Math.hypot(cx - x, cy - y);
    return dist > maxDist ? dist : maxDist;
  }, 0);

  return {
    x,
    y,
    renderedWidth: local.renderedWidth,
    maxCornerDistance,
  };
}

/**
 * Validates and trims the user's campaign brief before calling the server API.
 */
export function validateCampaignInput(
  input: CampaignInput,
): CampaignValidationResult {
  const sanitized: CampaignInput = {
    project: input.project.trim(),
    target: input.target.trim(),
    goal: input.goal.trim(),
    channel: input.channel.trim(),
  };

  const errors: Partial<Record<'project' | 'target' | 'goal', string>> = {};

  if (sanitized.project.length < 3) {
    errors.project = 'Décrivez brièvement votre projet (au moins 3 caractères).';
  }
  if (sanitized.target.length < 2) {
    errors.target = 'Précisez à qui s’adresse votre projet.';
  }
  if (sanitized.goal.length < 2) {
    errors.goal = 'Indiquez le résultat concret que vous souhaitez obtenir.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

/**
 * Safely validates the structured campaign payload returned by `/api/campaign`.
 */
export function parseCampaignResponse(raw: unknown): GeneratedCampaign | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const attirer = obj.attirer as Record<string, unknown> | undefined;
  const engager = obj.engager as Record<string, unknown> | undefined;
  const convertir = obj.convertir as Record<string, unknown> | undefined;

  const isNonEmpty = (val: unknown): val is string =>
    typeof val === 'string' && val.trim().length > 0;

  if (
    !attirer ||
    !engager ||
    !convertir ||
    !isNonEmpty(attirer.accroche) ||
    !isNonEmpty(attirer.formatConseille) ||
    !isNonEmpty(engager.recitCourt) ||
    !isNonEmpty(convertir.appelAction) ||
    !isNonEmpty(convertir.indicateurCle)
  ) {
    return null;
  }

  return {
    attirer: {
      accroche: attirer.accroche.trim(),
      formatConseille: attirer.formatConseille.trim(),
      justificationFormat: isNonEmpty(attirer.justificationFormat)
        ? attirer.justificationFormat.trim()
        : '',
    },
    engager: {
      recitCourt: engager.recitCourt.trim(),
      situation: isNonEmpty(engager.situation) ? engager.situation.trim() : '',
      tension: isNonEmpty(engager.tension) ? engager.tension.trim() : '',
      transformation: isNonEmpty(engager.transformation)
        ? engager.transformation.trim()
        : '',
    },
    convertir: {
      appelAction: convertir.appelAction.trim(),
      indicateurCle: convertir.indicateurCle.trim(),
      methodeMesure: isNonEmpty(convertir.methodeMesure)
        ? convertir.methodeMesure.trim()
        : '',
    },
  };
}
