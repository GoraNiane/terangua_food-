export interface HeroDish {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  posterUrl: string;
  videoUrl?: string;
  // Specific camera motion config
  motion: {
    startScale: number;
    endScale: number;
    startX: number;
    endX: number;
    startY: number;
    endY: number;
    transformOrigin: string;
  };
  // Atmosphere effect
  atmosphere: 'steam' | 'embers-smoke' | 'delicate-steam' | 'golden-shimmer';
}

export const HERO_DISHES: HeroDish[] = [
  {
    id: 'grillades',
    number: '01',
    title: 'GRILLADES & DIBI',
    subtitle: 'Braises Vives & Cuisson Traditionnelle',
    posterUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=85',
    videoUrl: '/videos/hero-cooking.webm',
    motion: {
      startScale: 1.0,
      endScale: 1.08,
      startX: 0,
      endX: -1,
      startY: 0,
      endY: -1,
      transformOrigin: '50% 50%',
    },
    atmosphere: 'embers-smoke',
  },
  {
    id: 'thieboudienne',
    number: '02',
    title: 'THIÉBOUDIENNE',
    subtitle: 'Céebu Jën Penda Mbaye',
    posterUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=85',
    motion: {
      startScale: 1.0,
      endScale: 1.12,
      startX: 0,
      endX: -2,
      startY: 0,
      endY: -3,
      transformOrigin: '55% 45%',
    },
    atmosphere: 'steam',
  },
  {
    id: 'yassa-poulet',
    number: '03',
    title: 'YASSA POULET',
    subtitle: 'Poulet Fermier aux Oignons Confits',
    posterUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1600&q=85',
    motion: {
      startScale: 1.04,
      endScale: 1.15,
      startX: 1,
      endX: -1,
      startY: 2,
      endY: -2,
      transformOrigin: '50% 50%',
    },
    atmosphere: 'steam',
  },
  {
    id: 'mafe',
    number: '04',
    title: 'MAFÉ AU BŒUF',
    subtitle: 'Ragoût Artisanal à l’Arachide de Kaolack',
    posterUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1600&q=85',
    motion: {
      startScale: 1.02,
      endScale: 1.10,
      startX: -2,
      endX: 2,
      startY: 0,
      endY: -2,
      transformOrigin: '48% 52%',
    },
    atmosphere: 'delicate-steam',
  },
  {
    id: 'thiebou-yapp',
    number: '05',
    title: 'THIÉBOU YAPP',
    subtitle: 'Riz Traditionnel à la Viande Fondante',
    posterUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&q=85',
    motion: {
      startScale: 1.0,
      endScale: 1.12,
      startX: 0,
      endX: 3,
      startY: -1,
      endY: -3,
      transformOrigin: '45% 60%',
    },
    atmosphere: 'steam',
  },
  {
    id: 'poisson-braise',
    number: '06',
    title: 'POISSON BRAISÉ',
    subtitle: 'Bar Grillé aux Épices Dakaroises',
    posterUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1600&q=85',
    motion: {
      startScale: 1.0,
      endScale: 1.11,
      startX: 2,
      endX: -2,
      startY: 0,
      endY: -2,
      transformOrigin: '52% 48%',
    },
    atmosphere: 'embers-smoke',
  },
  {
    id: 'dibi-agneau',
    number: '07',
    title: 'DIBI D’AGNEAU ROYAL',
    subtitle: 'Agneau Croustillant Mariné & Fumé',
    posterUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=85',
    motion: {
      startScale: 1.03,
      endScale: 1.14,
      startX: -1,
      endX: 2,
      startY: 2,
      endY: -1,
      transformOrigin: '50% 50%',
    },
    atmosphere: 'golden-shimmer',
  },
];
