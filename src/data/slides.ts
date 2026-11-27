import type { SlideId } from '../utils/presentation';

export interface SlidePoint {
  number: string;
  title: string;
  detail: string;
}

export interface SlideExampleItem {
  label: string;
  value: string;
}

export interface MethodSlide {
  id: Exclude<SlideId, 'accueil'>;
  stepNumber: string;
  stepLabel: string;
  kicker: string;
  title: string;
  mainIdea: string;
  points: [SlidePoint, SlidePoint, SlidePoint];
  example: {
    brand: string;
    context: string;
    items: SlideExampleItem[];
  };
}

export interface OutlineScreen {
  id: SlideId;
  index: string;
  label: string;
  subtitle: string;
}

export const COVER_COPY = {
  badgeTag: 'Intro',
  badgeLabel: 'De l’idée à l’action',
  titleLine1: 'Marketing digital',
  titleLine2: '& storytelling',
  paragraphLines: [
    'Captez l’attention avec du contenu.',
    'Racontez une histoire qui engage.',
    'Donnez envie de passer à l’action.',
  ] as const,
};

export const OUTLINE_SCREENS: readonly OutlineScreen[] = [
  {
    id: 'accueil',
    index: '00',
    label: 'Accueil',
    subtitle: 'Couverture — Marketing digital & storytelling',
  },
  {
    id: 'attirer',
    index: '01',
    label: 'Attirer',
    subtitle: 'Choisir une cible, écrire une accroche et choisir un format',
  },
  {
    id: 'engager',
    index: '02',
    label: 'Engager',
    subtitle: 'Partir d’une situation, créer la tension et montrer la transformation',
  },
  {
    id: 'convertir',
    index: '03',
    label: 'Convertir',
    subtitle: 'Formuler un appel à l’action clair et suivre le bon indicateur',
  },
];

export const METHOD_SLIDES: Record<Exclude<SlideId, 'accueil'>, MethodSlide> = {
  attirer: {
    id: 'attirer',
    stepNumber: '01',
    stepLabel: 'Attirer',
    kicker: 'Étape 01 · Stratégie d’attention',
    title: 'Capter le regard dès la première seconde',
    mainIdea:
      'On ne parle pas à tout le monde : on s’adresse à une personne précise avec un angle qui interrompt son défilement.',
    points: [
      {
        number: '01',
        title: 'Choisir une cible précise',
        detail:
          'Définir un profil clair, son quotidien et les mots exacts qu’il utilise pour décrire son besoin.',
      },
      {
        number: '02',
        title: 'Écrire une accroche directe',
        detail:
          'Ouvrir sur un constat vécu ou une promesse nette, lisible en moins de trois secondes.',
      },
      {
        number: '03',
        title: 'Choisir un format adapté',
        detail:
          'Sélectionner le support natif du canal (vidéo courte, carrousel, newsletter) pour servir le message.',
      },
    ],
    example: {
      brand: 'Maison Solis',
      context: 'Fil rouge · Café de spécialité torréfié à la commande',
      items: [
        {
          label: 'Cible',
          value:
            'Actifs en télétravail lassés des capsules fades qui cherchent un vrai rituel du matin.',
        },
        {
          label: 'Accroche',
          value:
            '« Pourquoi votre café de 9 h a le goût du carton — et ce que 90 secondes changent vraiment. »',
        },
        {
          label: 'Format',
          value:
            'Vidéo verticale de 20 s filmée au plus près de l’extraction, sous-titrée pour la lecture sans son.',
        },
      ],
    },
  },
  engager: {
    id: 'engager',
    stepNumber: '02',
    stepLabel: 'Engager',
    kicker: 'Étape 02 · Architecture du récit',
    title: 'Raconter une histoire qui retient l’attention',
    mainIdea:
      'Les arguments convainquent la raison, mais c’est l’arc narratif — situation, tension, transformation — qui crée l’attachement.',
    points: [
      {
        number: '01',
        title: 'Partir d’une situation réelle',
        detail:
          'Ancrer le récit dans une scène familière pour que l’audience se reconnaisse immédiatement.',
      },
      {
        number: '02',
        title: 'Introduire une tension',
        detail:
          'Nommer l’obstacle concret ou la déception qui empêche d’atteindre le résultat souhaité.',
      },
      {
        number: '03',
        title: 'Raconter la transformation',
        detail:
          'Montrer l’après tangible rendu possible par votre produit, sans surenchère publicitaire.',
      },
    ],
    example: {
      brand: 'Maison Solis',
      context: 'Fil rouge · Suite de la campagne en carrousel narratif',
      items: [
        {
          label: 'Situation',
          value:
            'Chaque matin, la journée démarre à la hâte avec un expresso brûlé avalé devant les e-mails.',
        },
        {
          label: 'Tension',
          value:
            'Impossible de retrouver chez soi la finesse d’un bon torréfacteur sans machine complexe ni perte de temps.',
        },
        {
          label: 'Transformation',
          value:
            'Un grain moulu 48 h avant l’envoi et trois gestes simples transforment la pause de 9 h en moment attendu.',
        },
      ],
    },
  },
  convertir: {
    id: 'convertir',
    stepNumber: '03',
    stepLabel: 'Convertir',
    kicker: 'Étape 03 · Passage à l’action',
    title: 'Guider vers un geste simple et mesurable',
    mainIdea:
      'Une histoire efficace s’achève toujours par une prochaine étape évidente et un indicateur unique qui prouve son impact.',
    points: [
      {
        number: '01',
        title: 'Formuler un appel à l’action précis',
        detail:
          'Un verbe concret, un bénéfice immédiat et une promesse claire sur ce qui se passe après le clic.',
      },
      {
        number: '02',
        title: 'Lever la dernière friction',
        detail:
          'Rendre le premier pas léger : essai découverte, démonstration courte ou offre sans engagement.',
      },
      {
        number: '03',
        title: 'Choisir le bon indicateur',
        detail:
          'Suivre la mesure directement liée à l’objectif (commandes, inscriptions, rendez-vous) plutôt que les seuls clics.',
      },
    ],
    example: {
      brand: 'Maison Solis',
      context: 'Fil rouge · Finalisation et mesure de la campagne',
      items: [
        {
          label: 'Appel à l’action',
          value:
            '« Recevoir mon coffret découverte 3 origines — livré en 48 h, sans engagement. »',
        },
        {
          label: 'Indicateur clé',
          value:
            'Taux de conversion visiteur de la page découverte → commande (objectif : 3,5 % sur 30 jours).',
        },
        {
          label: 'Mesure',
          value:
            'Lien traqué dédié par format (vidéo vs carrousel) et suivi du réachat au deuxième mois.',
        },
      ],
    },
  },
};
