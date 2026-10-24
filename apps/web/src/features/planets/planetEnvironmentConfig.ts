import { PlanetId, PLANET_CATALOG } from '@lucid/shared';

export interface PlanetSkyConfig {
  zenithColor: string;
  horizonColor: string;
  nadirColor: string;
}

export interface PlanetSunConfig {
  position: [number, number, number];
  color: string;
  intensity: number;
  coreRadius: number;
  coronaRadius: number;
  coronaColor: string;
  coronaOpacity: number;
  hasSolarRays?: boolean;
}

export interface PlanetLightingConfig {
  ambientColor: string;
  ambientIntensity: number;
  hemisphereSkyColor: string;
  hemisphereGroundColor: string;
  hemisphereIntensity: number;
  directionalColor: string;
  directionalIntensity: number;
}

export interface PlanetFogConfig {
  color: string;
  near: number;
  far: number;
}

export interface PlanetHorizonConfig {
  type: 'mountains' | 'confectionery' | 'crystals' | 'voxel' | 'canopy' | 'abyss' | 'volcanic' | 'clouds';
  color: string;
  distance: number;
  height: number;
  count: number;
}

export interface PlanetParticleConfig {
  type: 'stardust' | 'sugar' | 'cyber' | 'spores' | 'crystals' | 'bubbles' | 'embers' | 'clouds';
  color: string;
  count: number;
  size: number;
  speed: number;
  spread: [number, number, number];
}

export interface PlanetCloudConfig {
  enabled: boolean;
  color: string;
  altitude: number;
  opacity: number;
  speed: number;
  layerCount: number;
}

export interface PlanetTerrainConfig {
  textureType: 'rocky' | 'sand' | 'candy' | 'crystal' | 'grid';
  groundColor: string;
  skirtColor: string;
  roughness: number;
  metalness: number;
}

export interface PlanetEnvironmentConfig {
  id: PlanetId;
  name: string;
  sky: PlanetSkyConfig;
  sun: PlanetSunConfig;
  lighting: PlanetLightingConfig;
  fog: PlanetFogConfig;
  horizon: PlanetHorizonConfig;
  particles: PlanetParticleConfig;
  clouds: PlanetCloudConfig;
  terrain: PlanetTerrainConfig;
}

export const PLANET_ENVIRONMENTS: Record<PlanetId, PlanetEnvironmentConfig> = {
  origin: {
    id: 'origin',
    name: 'Origin — The Beginning',
    sky: {
      zenithColor: '#0a1033',
      horizonColor: '#1e295d',
      nadirColor: '#070c24',
    },
    sun: {
      position: [45, 60, 35],
      color: '#e0e7ff',
      intensity: 2.2,
      coreRadius: 10,
      coronaRadius: 32,
      coronaColor: '#818cf8',
      coronaOpacity: 0.65,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#c7d2fe',
      ambientIntensity: 0.85,
      hemisphereSkyColor: '#a5b4fc',
      hemisphereGroundColor: '#1e1b4b',
      hemisphereIntensity: 0.9,
      directionalColor: '#e0e7ff',
      directionalIntensity: 2.2,
    },
    fog: {
      color: '#1e295d',
      near: 35,
      far: 170,
    },
    horizon: {
      type: 'mountains',
      color: '#161e47',
      distance: 90,
      height: 24,
      count: 24,
    },
    particles: {
      type: 'stardust',
      color: '#93c5fd',
      count: 320,
      size: 0.25,
      speed: 0.3,
      spread: [60, 25, 60],
    },
    clouds: {
      enabled: true,
      color: '#312e81',
      altitude: 75,
      opacity: 0.35,
      speed: 0.08,
      layerCount: 2,
    },
    terrain: {
      textureType: 'rocky',
      groundColor: '#334155',
      skirtColor: '#1e293b',
      roughness: 0.82,
      metalness: 0.18,
    },
  },

  candyverse: {
    id: 'candyverse',
    name: 'Candyverse',
    sky: {
      zenithColor: '#701a75',
      horizonColor: '#f472b6',
      nadirColor: '#4a044e',
    },
    sun: {
      position: [50, 65, -35],
      color: '#fffbeb',
      intensity: 2.4,
      coreRadius: 12,
      coronaRadius: 36,
      coronaColor: '#fbbf24',
      coronaOpacity: 0.75,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#fce7f3',
      ambientIntensity: 0.95,
      hemisphereSkyColor: '#fbcfe8',
      hemisphereGroundColor: '#701a75',
      hemisphereIntensity: 1.0,
      directionalColor: '#fffbeb',
      directionalIntensity: 2.4,
    },
    fog: {
      color: '#f472b6',
      near: 40,
      far: 180,
    },
    horizon: {
      type: 'confectionery',
      color: '#db2777',
      distance: 95,
      height: 22,
      count: 28,
    },
    particles: {
      type: 'sugar',
      color: '#fdf2f8',
      count: 350,
      size: 0.3,
      speed: 0.35,
      spread: [65, 30, 65],
    },
    clouds: {
      enabled: true,
      color: '#fce7f3',
      altitude: 80,
      opacity: 0.45,
      speed: 0.12,
      layerCount: 3,
    },
    terrain: {
      textureType: 'candy',
      groundColor: '#f9a8d4',
      skirtColor: '#ec4899',
      roughness: 0.65,
      metalness: 0.1,
    },
  },

  pixel: {
    id: 'pixel',
    name: 'Pixel Realm',
    sky: {
      zenithColor: '#06203a',
      horizonColor: '#0d5475',
      nadirColor: '#031222',
    },
    sun: {
      position: [-40, 55, 30],
      color: '#6ee7b7',
      intensity: 2.0,
      coreRadius: 9,
      coronaRadius: 28,
      coronaColor: '#10b981',
      coronaOpacity: 0.7,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#a7f3d0',
      ambientIntensity: 0.9,
      hemisphereSkyColor: '#34d399',
      hemisphereGroundColor: '#06203a',
      hemisphereIntensity: 0.85,
      directionalColor: '#6ee7b7',
      directionalIntensity: 2.0,
    },
    fog: {
      color: '#0d5475',
      near: 35,
      far: 160,
    },
    horizon: {
      type: 'voxel',
      color: '#093c54',
      distance: 85,
      height: 20,
      count: 32,
    },
    particles: {
      type: 'cyber',
      color: '#34d399',
      count: 300,
      size: 0.28,
      speed: 0.4,
      spread: [55, 25, 55],
    },
    clouds: {
      enabled: true,
      color: '#0e7490',
      altitude: 70,
      opacity: 0.3,
      speed: 0.1,
      layerCount: 2,
    },
    terrain: {
      textureType: 'grid',
      groundColor: '#0a3652',
      skirtColor: '#06203a',
      roughness: 0.75,
      metalness: 0.25,
    },
  },

  nature: {
    id: 'nature',
    name: 'Nature Prime',
    sky: {
      zenithColor: '#064e3b',
      horizonColor: '#15803d',
      nadirColor: '#022c22',
    },
    sun: {
      position: [35, 70, 25],
      color: '#fef08a',
      intensity: 2.5,
      coreRadius: 11,
      coronaRadius: 35,
      coronaColor: '#fde047',
      coronaOpacity: 0.8,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#dcfce7',
      ambientIntensity: 0.95,
      hemisphereSkyColor: '#86efac',
      hemisphereGroundColor: '#064e3b',
      hemisphereIntensity: 1.0,
      directionalColor: '#fef08a',
      directionalIntensity: 2.5,
    },
    fog: {
      color: '#15803d',
      near: 38,
      far: 175,
    },
    horizon: {
      type: 'canopy',
      color: '#0f5132',
      distance: 90,
      height: 26,
      count: 30,
    },
    particles: {
      type: 'spores',
      color: '#bbf7d0',
      count: 360,
      size: 0.32,
      speed: 0.25,
      spread: [60, 28, 60],
    },
    clouds: {
      enabled: true,
      color: '#d1fae5',
      altitude: 78,
      opacity: 0.4,
      speed: 0.14,
      layerCount: 3,
    },
    terrain: {
      textureType: 'rocky',
      groundColor: '#166534',
      skirtColor: '#14532d',
      roughness: 0.8,
      metalness: 0.12,
    },
  },

  glassia: {
    id: 'glassia',
    name: 'Glassia',
    sky: {
      zenithColor: '#0c4a6e',
      horizonColor: '#38bdf8',
      nadirColor: '#082f49',
    },
    sun: {
      position: [20, 65, 45],
      color: '#f0f9ff',
      intensity: 2.3,
      coreRadius: 10,
      coronaRadius: 34,
      coronaColor: '#7dd3fc',
      coronaOpacity: 0.75,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#e0f2fe',
      ambientIntensity: 0.9,
      hemisphereSkyColor: '#bae6fd',
      hemisphereGroundColor: '#0c4a6e',
      hemisphereIntensity: 0.95,
      directionalColor: '#f0f9ff',
      directionalIntensity: 2.3,
    },
    fog: {
      color: '#38bdf8',
      near: 40,
      far: 180,
    },
    horizon: {
      type: 'crystals',
      color: '#0284c7',
      distance: 92,
      height: 28,
      count: 26,
    },
    particles: {
      type: 'crystals',
      color: '#e0f2fe',
      count: 320,
      size: 0.26,
      speed: 0.32,
      spread: [60, 26, 60],
    },
    clouds: {
      enabled: true,
      color: '#e0f2fe',
      altitude: 82,
      opacity: 0.35,
      speed: 0.1,
      layerCount: 2,
    },
    terrain: {
      textureType: 'crystal',
      groundColor: '#0284c7',
      skirtColor: '#0369a1',
      roughness: 0.35,
      metalness: 0.45,
    },
  },

  abyss: {
    id: 'abyss',
    name: 'The Abyss',
    sky: {
      zenithColor: '#042f2e',
      horizonColor: '#0f766e',
      nadirColor: '#021817',
    },
    sun: {
      position: [0, 55, -20],
      color: '#5eead4',
      intensity: 1.8,
      coreRadius: 14,
      coronaRadius: 40,
      coronaColor: '#2dd4bf',
      coronaOpacity: 0.65,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#99f6e4',
      ambientIntensity: 0.85,
      hemisphereSkyColor: '#2dd4bf',
      hemisphereGroundColor: '#042f2e',
      hemisphereIntensity: 0.85,
      directionalColor: '#5eead4',
      directionalIntensity: 1.8,
    },
    fog: {
      color: '#0f766e',
      near: 30,
      far: 140,
    },
    horizon: {
      type: 'abyss',
      color: '#115e59',
      distance: 80,
      height: 20,
      count: 24,
    },
    particles: {
      type: 'bubbles',
      color: '#ccfbf1',
      count: 380,
      size: 0.35,
      speed: 0.45,
      spread: [65, 30, 65],
    },
    clouds: {
      enabled: false,
      color: '#134e4a',
      altitude: 60,
      opacity: 0.25,
      speed: 0.05,
      layerCount: 1,
    },
    terrain: {
      textureType: 'sand',
      groundColor: '#0f766e',
      skirtColor: '#115e59',
      roughness: 0.75,
      metalness: 0.15,
    },
  },

  zephyr: {
    id: 'zephyr',
    name: 'Zephyr — Cloud City',
    sky: {
      zenithColor: '#312e81',
      horizonColor: '#fb923c',
      nadirColor: '#1e1b4b',
    },
    sun: {
      position: [40, 55, 35],
      color: '#ffedd5',
      intensity: 2.5,
      coreRadius: 11,
      coronaRadius: 36,
      coronaColor: '#f97316',
      coronaOpacity: 0.8,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#ffedd5',
      ambientIntensity: 0.95,
      hemisphereSkyColor: '#fdba74',
      hemisphereGroundColor: '#312e81',
      hemisphereIntensity: 1.0,
      directionalColor: '#ffedd5',
      directionalIntensity: 2.5,
    },
    fog: {
      color: '#fb923c',
      near: 42,
      far: 190,
    },
    horizon: {
      type: 'clouds',
      color: '#ea580c',
      distance: 95,
      height: 25,
      count: 28,
    },
    particles: {
      type: 'clouds',
      color: '#ffedd5',
      count: 340,
      size: 0.35,
      speed: 0.38,
      spread: [70, 32, 70],
    },
    clouds: {
      enabled: true,
      color: '#fed7aa',
      altitude: 72,
      opacity: 0.5,
      speed: 0.18,
      layerCount: 4,
    },
    terrain: {
      textureType: 'rocky',
      groundColor: '#c2410c',
      skirtColor: '#9a3412',
      roughness: 0.78,
      metalness: 0.15,
    },
  },

  ignis: {
    id: 'ignis',
    name: 'Ignis — Molten Core',
    sky: {
      zenithColor: '#450a0a',
      horizonColor: '#b91c1c',
      nadirColor: '#1c0505',
    },
    sun: {
      position: [0, 50, -30],
      color: '#fed7aa',
      intensity: 2.3,
      coreRadius: 13,
      coronaRadius: 38,
      coronaColor: '#ef4444',
      coronaOpacity: 0.8,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#fecaca',
      ambientIntensity: 0.9,
      hemisphereSkyColor: '#f87171',
      hemisphereGroundColor: '#450a0a',
      hemisphereIntensity: 0.95,
      directionalColor: '#fee2e2',
      directionalIntensity: 2.3,
    },
    fog: {
      color: '#b91c1c',
      near: 36,
      far: 165,
    },
    horizon: {
      type: 'volcanic',
      color: '#7f1d1d',
      distance: 88,
      height: 26,
      count: 26,
    },
    particles: {
      type: 'embers',
      color: '#f87171',
      count: 360,
      size: 0.3,
      speed: 0.45,
      spread: [60, 28, 60],
    },
    clouds: {
      enabled: true,
      color: '#7f1d1d',
      altitude: 68,
      opacity: 0.4,
      speed: 0.1,
      layerCount: 2,
    },
    terrain: {
      textureType: 'rocky',
      groundColor: '#450a0a',
      skirtColor: '#280505',
      roughness: 0.88,
      metalness: 0.22,
    },
  },

  astraea: {
    id: 'astraea',
    name: 'Astraea — Glacial Moon',
    sky: {
      zenithColor: '#083344',
      horizonColor: '#06b6d4',
      nadirColor: '#04222f',
    },
    sun: {
      position: [-35, 60, 30],
      color: '#cffafe',
      intensity: 2.4,
      coreRadius: 10,
      coronaRadius: 32,
      coronaColor: '#22d3ee',
      coronaOpacity: 0.75,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#e0f2fe',
      ambientIntensity: 0.92,
      hemisphereSkyColor: '#67e8f9',
      hemisphereGroundColor: '#083344',
      hemisphereIntensity: 0.95,
      directionalColor: '#cffafe',
      directionalIntensity: 2.4,
    },
    fog: {
      color: '#06b6d4',
      near: 40,
      far: 180,
    },
    horizon: {
      type: 'mountains',
      color: '#0e7490',
      distance: 92,
      height: 27,
      count: 26,
    },
    particles: {
      type: 'crystals',
      color: '#a5f3fc',
      count: 340,
      size: 0.28,
      speed: 0.3,
      spread: [65, 28, 65],
    },
    clouds: {
      enabled: true,
      color: '#cffafe',
      altitude: 76,
      opacity: 0.35,
      speed: 0.12,
      layerCount: 2,
    },
    terrain: {
      textureType: 'crystal',
      groundColor: '#0e7490',
      skirtColor: '#155e75',
      roughness: 0.4,
      metalness: 0.35,
    },
  },

  chronos: {
    id: 'chronos',
    name: 'Chronos — The Clockwork Matrix',
    sky: {
      zenithColor: '#451a03',
      horizonColor: '#f59e0b',
      nadirColor: '#270e02',
    },
    sun: {
      position: [40, 58, 20],
      color: '#fef3c7',
      intensity: 2.4,
      coreRadius: 11,
      coronaRadius: 35,
      coronaColor: '#d97706',
      coronaOpacity: 0.8,
      hasSolarRays: true,
    },
    lighting: {
      ambientColor: '#fde68a',
      ambientIntensity: 0.95,
      hemisphereSkyColor: '#fcd34d',
      hemisphereGroundColor: '#451a03',
      hemisphereIntensity: 1.0,
      directionalColor: '#fef3c7',
      directionalIntensity: 2.4,
    },
    fog: {
      color: '#f59e0b',
      near: 38,
      far: 175,
    },
    horizon: {
      type: 'mountains',
      color: '#b45309',
      distance: 90,
      height: 25,
      count: 28,
    },
    particles: {
      type: 'stardust',
      color: '#fef08a',
      count: 320,
      size: 0.28,
      speed: 0.35,
      spread: [60, 26, 60],
    },
    clouds: {
      enabled: true,
      color: '#fde68a',
      altitude: 74,
      opacity: 0.4,
      speed: 0.12,
      layerCount: 3,
    },
    terrain: {
      textureType: 'rocky',
      groundColor: '#78350f',
      skirtColor: '#451a03',
      roughness: 0.72,
      metalness: 0.38,
    },
  },
};

export function getPlanetEnvironment(planetId: PlanetId): PlanetEnvironmentConfig {
  return PLANET_ENVIRONMENTS[planetId] || PLANET_ENVIRONMENTS.origin;
}
