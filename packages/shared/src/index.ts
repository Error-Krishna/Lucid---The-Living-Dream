// ===================================================================
// LUCID: The Living Dream - Shared Types & Contracts
// ===================================================================

export type PlanetId =
  | 'origin'
  | 'candyverse'
  | 'pixel'
  | 'nature'
  | 'glassia'
  | 'abyss'
  | 'zephyr'
  | 'ignis'
  | 'astraea'
  | 'chronos';

export type PlanetCategory =
  | 'Cosmic Hub'
  | 'Confectionery Dream'
  | 'Voxel Architecture'
  | 'Living Canopy'
  | 'Crystalline Prisms'
  | 'Submerged Abyss'
  | 'Floating Cloudscape'
  | 'Molten Fracture'
  | 'Glacial Moon'
  | 'Clockwork Matrix';

export interface PlanetMetadata {
  id: PlanetId;
  name: string;
  tagline: string;
  description: string;
  category: PlanetCategory;
  celestialPosition: [number, number, number]; // Position in 3D Universe View
  radius: number; // Visual scale in space
  hasRings?: boolean;
  ringColor?: string;
  distanceLightYears: number; // e.g. 0.35 ly
  visualTheme: {
    skyColor: string;
    horizonColor: string;
    groundColor: string;
    fogColor: string;
    fogDensity: number;
    ambientLightColor: string;
    ambientLightIntensity: number;
    sunColor: string;
    sunPosition: [number, number, number];
    particleColor: string;
    particleCount: number;
    accentColor: string;
  };
  rules: {
    gravity: number; // normal 9.8, floaty 4.5, abyss 2.2
    moveSpeed: number;
    jumpForce: number;
    ambientSoundChord: string[];
    specialEffect: string;
  };
  landmark: {
    name: string;
    lore: string;
    position: [number, number, number];
    actionPrompt: string;
  };
  startingSpawn: [number, number, number];
  landingPadPosition: [number, number, number];
}

export type TravelState =
  | 'universe'
  | 'destination_selected'
  | 'preparing'
  | 'cruising'
  | 'approaching'
  | 'landing'
  | 'on_planet'
  | 'boarding'
  | 'taking_off';

export type ObjectType =
  | 'dream_beacon'
  | 'resonant_crystal'
  | 'bioluminescent_flora'
  | 'geometric_monument'
  | 'levitating_platform'
  | 'star_monolith';

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface ObjectAppearance {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  transparent?: boolean;
  variant?: number;
}

export interface WorldObject {
  objectId: string;
  locationId: PlanetId;
  creatorId: string;
  creatorName: string;
  type: ObjectType;
  transform: Transform;
  appearance: ObjectAppearance;
  permissions: 'public' | 'private';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarConfig {
  color: string;
  glowColor: string;
  style: 'wanderer' | 'shimmer' | 'monolith' | 'celestial';
}

export type AvatarEmote = 'idle' | 'walk' | 'run' | 'jump' | 'wave' | 'sit' | 'dance' | 'float';

export interface AvatarPresence {
  sessionId: string;
  userId: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  locationId: PlanetId;
  position: [number, number, number];
  rotation: [number, number, number];
  emote: AvatarEmote;
  lastSeenAt: number;
  isSimulated?: boolean;
}

export interface EnvironmentState {
  transformationActive: boolean;
  transformationType?: string;
  cycleTime: number;
}

// -------------------------------------------------------------------
// Socket Event Contracts
// -------------------------------------------------------------------

export interface LocationJoinPayload {
  locationId: PlanetId;
  userId: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  initialPosition?: [number, number, number];
}

export interface LocationSnapshotPayload {
  locationId: PlanetId;
  objects: WorldObject[];
  presences: AvatarPresence[];
  environment: EnvironmentState;
}

export interface AvatarStatePayload {
  position: [number, number, number];
  rotation: [number, number, number];
  emote: AvatarEmote;
}

export interface ObjectCreatePayload {
  object: Omit<WorldObject, 'objectId' | 'version' | 'createdAt' | 'updatedAt'>;
}

export interface ObjectUpdatePayload {
  objectId: string;
  transform?: Partial<Transform>;
  appearance?: Partial<ObjectAppearance>;
  version: number;
}

export interface ObjectDeletePayload {
  objectId: string;
  version?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  locationId: PlanetId;
}

// -------------------------------------------------------------------
// Streamlined Feedback Survey Structure
// -------------------------------------------------------------------

export type FeedbackExperience = 'Amazing' | 'Good' | 'Okay' | 'Not for me';

export type FeedbackPrimaryInterest =
  | 'Exploring the planets'
  | 'The visuals and atmosphere'
  | 'Moving around and interacting with the world'
  | 'The idea of a shared, persistent universe'
  | 'I did not find it interesting yet';

export type FeedbackDecision = 'YES' | 'NO';

export interface FeedbackSubmission {
  id?: string;
  // New streamlined format
  experienceRating?: FeedbackExperience;
  primaryInterest?: FeedbackPrimaryInterest;
  decision: FeedbackDecision;
  improvements?: string; // Optional single comment

  // Backwards compatibility fields
  rating?: number;
  interest?: string;
  favoriteFeatures?: string[];
  problems?: string;
  additionalThoughts?: string;

  submittedAt: string;
  prototypeVersion: string;
  isLocal?: boolean;
}

// -------------------------------------------------------------------
// Multiverse Planet Catalog
// -------------------------------------------------------------------

export const PLANET_CATALOG: Record<PlanetId, PlanetMetadata> = {
  origin: {
    id: 'origin',
    name: 'Origin — The Beginning',
    tagline: 'The Crossroads of Dreams',
    description: 'The primordial sanctuary anchored in deep cosmic starlight. Towering arches, concentric energy platforms, and the ancient Monolith of Origin.',
    category: 'Cosmic Hub',
    celestialPosition: [0, 0, 0],
    radius: 3.2,
    hasRings: true,
    ringColor: '#6366f1',
    distanceLightYears: 0.0,
    visualTheme: {
      skyColor: '#030514',
      horizonColor: '#0b1338',
      groundColor: '#121733',
      fogColor: '#080d26',
      fogDensity: 0.025,
      ambientLightColor: '#8a99cc',
      ambientLightIntensity: 0.8,
      sunColor: '#c8d6ff',
      sunPosition: [15, 30, 20],
      particleColor: '#9bb7ff',
      particleCount: 240,
      accentColor: '#6366f1',
    },
    rules: {
      gravity: 9.8,
      moveSpeed: 6.5,
      jumpForce: 5.5,
      ambientSoundChord: ['C3', 'G3', 'C4', 'E4', 'B4'],
      specialEffect: 'Pulsing celestial rings around the central monolith.',
    },
    landmark: {
      name: 'The Monolith of Origin',
      lore: 'The primordial beacon that first tethered wandering human subconsciousness into a shared sanctuary.',
      position: [0, 2.5, -9],
      actionPrompt: 'Touch the Core to channel resonant light',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  candyverse: {
    id: 'candyverse',
    name: 'Candyverse',
    tagline: 'A Playful, Surreal Confection',
    description: 'A whimsical dreamscape of pastel marshmallow hills, spun sugar spire rings, and floating gummy spheres where physics feels light and bouncy.',
    category: 'Confectionery Dream',
    celestialPosition: [-24, 8, -18],
    radius: 2.8,
    hasRings: true,
    ringColor: '#f472b6',
    distanceLightYears: 0.32,
    visualTheme: {
      skyColor: '#2a132e',
      horizonColor: '#612a52',
      groundColor: '#e098a8',
      fogColor: '#451e3c',
      fogDensity: 0.02,
      ambientLightColor: '#ffd1dc',
      ambientLightIntensity: 1.0,
      sunColor: '#ffe8ec',
      sunPosition: [20, 25, -15],
      particleColor: '#ffb3ba',
      particleCount: 220,
      accentColor: '#f472b6',
    },
    rules: {
      gravity: 4.8,
      moveSpeed: 7.2,
      jumpForce: 7.5,
      ambientSoundChord: ['F3', 'A3', 'C4', 'E4', 'G4'],
      specialEffect: 'Floating pastel confectionery bubbles floating skyward.',
    },
    landmark: {
      name: 'The Sugar Spire',
      lore: 'Spun from forgotten childhood daydreams, it hums with sweet crystalline frequencies.',
      position: [0, 3, -12],
      actionPrompt: 'Awaken the Spire with sugar resonance',
    },
    startingSpawn: [0, 0.0, 4],
    landingPadPosition: [0, 0.2, 6],
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel Realm',
    tagline: 'Voxel Architectures of Memory',
    description: 'A digitized realm forged from stepping voxel terraces, cascading digital blocks, and neon-lit data monolithic pillars.',
    category: 'Voxel Architecture',
    celestialPosition: [28, -6, -22],
    radius: 2.6,
    hasRings: false,
    distanceLightYears: 0.45,
    visualTheme: {
      skyColor: '#040b17',
      horizonColor: '#06203a',
      groundColor: '#0a3652',
      fogColor: '#07182c',
      fogDensity: 0.03,
      ambientLightColor: '#6ee7b7',
      ambientLightIntensity: 0.9,
      sunColor: '#34d399',
      sunPosition: [-20, 25, 10],
      particleColor: '#10b981',
      particleCount: 260,
      accentColor: '#10b981',
    },
    rules: {
      gravity: 10.5,
      moveSpeed: 6.8,
      jumpForce: 5.8,
      ambientSoundChord: ['D3', 'F3', 'A3', 'C4', 'F4'],
      specialEffect: 'Quantized particle pulses and stepped block shadows.',
    },
    landmark: {
      name: 'Bit-Monolith 01',
      lore: 'The fundamental logic core from which the voxel reality recompiles itself each cycle.',
      position: [0, 3, -10],
      actionPrompt: 'Sync voxel matrix pulse',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  nature: {
    id: 'nature',
    name: 'Nature Prime',
    tagline: 'The Ever-Breathing Canopy',
    description: 'An organic haven of procedural bioluminescent flora, ancient weeping willow structures, and tranquil ambient breeze.',
    category: 'Living Canopy',
    celestialPosition: [-16, -14, 25],
    radius: 3.0,
    hasRings: false,
    distanceLightYears: 0.58,
    visualTheme: {
      skyColor: '#06130d',
      horizonColor: '#0f291c',
      groundColor: '#1a3d28',
      fogColor: '#0b1e15',
      fogDensity: 0.022,
      ambientLightColor: '#a7f3d0',
      ambientLightIntensity: 0.85,
      sunColor: '#fef08a',
      sunPosition: [10, 30, -20],
      particleColor: '#86efac',
      particleCount: 250,
      accentColor: '#22c55e',
    },
    rules: {
      gravity: 9.8,
      moveSpeed: 6.2,
      jumpForce: 5.2,
      ambientSoundChord: ['E3', 'G3', 'B3', 'D4', 'G4'],
      specialEffect: 'Floating bioluminescent spores that gently drift on wind currents.',
    },
    landmark: {
      name: 'The Mother Spore Grove',
      lore: 'An ancient sentient root system whispering memories of the world before dreaming began.',
      position: [0, 3.5, -11],
      actionPrompt: 'Attune with the fungal network',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  glassia: {
    id: 'glassia',
    name: 'Glassia',
    tagline: 'Prisms, Reflections, and Shards',
    description: 'A crystalline sanctuary of translucent spires, geometric refraction towers, and frozen aurora reflections.',
    category: 'Crystalline Prisms',
    celestialPosition: [22, 16, 15],
    radius: 2.7,
    hasRings: true,
    ringColor: '#38bdf8',
    distanceLightYears: 0.64,
    visualTheme: {
      skyColor: '#030d1a',
      horizonColor: '#0b2742',
      groundColor: '#163f63',
      fogColor: '#081d33',
      fogDensity: 0.02,
      ambientLightColor: '#93c5fd',
      ambientLightIntensity: 0.95,
      sunColor: '#e0f2fe',
      sunPosition: [0, 35, 15],
      particleColor: '#bfdbfe',
      particleCount: 280,
      accentColor: '#38bdf8',
    },
    rules: {
      gravity: 8.5,
      moveSpeed: 6.5,
      jumpForce: 5.6,
      ambientSoundChord: ['A3', 'C4', 'E4', 'G4', 'B4'],
      specialEffect: 'Refractive light glints dancing across crystal facets.',
    },
    landmark: {
      name: 'The Prism Citadel',
      lore: 'A towering optical prism that fractures single thoughts into spectrums of light.',
      position: [0, 3.5, -10],
      actionPrompt: 'Refract celestial aurora',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  abyss: {
    id: 'abyss',
    name: 'The Abyss',
    tagline: 'Submerged Dream Below the Depths',
    description: 'A boundless oceanic expanse dotted with sunken cyclopean ruins, bioluminescent jellyfish lanterns, and weightless fluid navigation.',
    category: 'Submerged Abyss',
    celestialPosition: [-32, 4, 30],
    radius: 3.4,
    hasRings: false,
    distanceLightYears: 0.81,
    visualTheme: {
      skyColor: '#010912',
      horizonColor: '#041724',
      groundColor: '#08253a',
      fogColor: '#02101c',
      fogDensity: 0.038,
      ambientLightColor: '#5eead4',
      ambientLightIntensity: 0.7,
      sunColor: '#2dd4bf',
      sunPosition: [0, 20, -10],
      particleColor: '#2dd4bf',
      particleCount: 320,
      accentColor: '#14b8a6',
    },
    rules: {
      gravity: 2.2,
      moveSpeed: 5.5,
      jumpForce: 8.0,
      ambientSoundChord: ['D3', 'G3', 'A3', 'C4', 'F4'],
      specialEffect: 'Deep oceanic currents with rising marine bubbles.',
    },
    landmark: {
      name: 'The Sunken Obelisk',
      lore: 'Carved with forgotten sigils that glow softly in response to dreaming visitors.',
      position: [0, 2.5, -9],
      actionPrompt: 'Commune with the abyssal depths',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  zephyr: {
    id: 'zephyr',
    name: 'Zephyr — Cloud City',
    tagline: 'Floating Citadels in the Sky',
    description: 'Airborne dream arches, perpetual golden twilight winds, and levitating platforms suspended in boundless cloud formations.',
    category: 'Floating Cloudscape',
    celestialPosition: [36, -18, -10],
    radius: 3.1,
    hasRings: true,
    ringColor: '#fed7aa',
    distanceLightYears: 0.95,
    visualTheme: {
      skyColor: '#1a102f',
      horizonColor: '#432352',
      groundColor: '#3b214c',
      fogColor: '#26143b',
      fogDensity: 0.025,
      ambientLightColor: '#fed7aa',
      ambientLightIntensity: 0.85,
      sunColor: '#fb923c',
      sunPosition: [15, 20, 25],
      particleColor: '#fdba74',
      particleCount: 220,
      accentColor: '#f97316',
    },
    rules: {
      gravity: 3.8,
      moveSpeed: 7.0,
      jumpForce: 7.0,
      ambientSoundChord: ['G3', 'B3', 'D4', 'F#4', 'A4'],
      specialEffect: 'Gentle warm air currents lifting floating cloud islands.',
    },
    landmark: {
      name: 'The Stratos Spire',
      lore: 'An observatory built high above the storms, tracking winds across the dream multiverse.',
      position: [0, 3, -11],
      actionPrompt: 'Channel stratosphere winds',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  ignis: {
    id: 'ignis',
    name: 'Ignis — Molten Core',
    tagline: 'Ember Veins and Obsidian Shards',
    description: 'A subterranean fracture of cooled black obsidian, glowing crimson magma fissures, and rising incandescent heat waves.',
    category: 'Molten Fracture',
    celestialPosition: [-42, -12, -26],
    radius: 2.9,
    hasRings: false,
    distanceLightYears: 1.12,
    visualTheme: {
      skyColor: '#120404',
      horizonColor: '#300a0a',
      groundColor: '#1f1313',
      fogColor: '#1c0505',
      fogDensity: 0.035,
      ambientLightColor: '#fca5a5',
      ambientLightIntensity: 0.9,
      sunColor: '#ef4444',
      sunPosition: [0, 25, -15],
      particleColor: '#f87171',
      particleCount: 260,
      accentColor: '#ef4444',
    },
    rules: {
      gravity: 8.5,
      moveSpeed: 6.4,
      jumpForce: 5.5,
      ambientSoundChord: ['D3', 'F3', 'A3', 'C#4', 'E4'],
      specialEffect: 'Rising embers and pulsing obsidian vein fissures.',
    },
    landmark: {
      name: 'The Obsidian Anvil',
      lore: 'Forged from the primordial core of ancient stars, still radiating heat.',
      position: [0, 2.5, -9],
      actionPrompt: 'Kindle volcanic furnace',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  astraea: {
    id: 'astraea',
    name: 'Astraea — Glacial Moon',
    tagline: 'Frozen Spires and Polar Auroras',
    description: 'A silent, frozen celestial moon wrapped in shimmering turquoise auroras, deep glacial ravines, and eternal starlight.',
    category: 'Glacial Moon',
    celestialPosition: [18, 28, -35],
    radius: 2.5,
    hasRings: true,
    ringColor: '#a5f3fc',
    distanceLightYears: 1.28,
    visualTheme: {
      skyColor: '#020b14',
      horizonColor: '#082338',
      groundColor: '#103957',
      fogColor: '#041624',
      fogDensity: 0.024,
      ambientLightColor: '#cffafe',
      ambientLightIntensity: 0.9,
      sunColor: '#67e8f9',
      sunPosition: [-10, 30, 20],
      particleColor: '#a5f3fc',
      particleCount: 280,
      accentColor: '#06b6d4',
    },
    rules: {
      gravity: 5.2,
      moveSpeed: 6.8,
      jumpForce: 6.4,
      ambientSoundChord: ['E3', 'B3', 'E4', 'G#4', 'B4'],
      specialEffect: 'Undulating polar auroras shimmering through the atmosphere.',
    },
    landmark: {
      name: 'The Glacial Needle',
      lore: 'A needle of pure cryo-ice that captures starlight from distant galaxies.',
      position: [0, 3.5, -10],
      actionPrompt: 'Resonate polar aurora',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
  chronos: {
    id: 'chronos',
    name: 'Chronos — The Clockwork Matrix',
    tagline: 'Gears, Brass, and Time Fragments',
    description: 'An architectural reality governed by rotating brass astrolabes, interlocking cog structures, and synchronized pendulum platforms.',
    category: 'Clockwork Matrix',
    celestialPosition: [-14, 32, 22],
    radius: 2.7,
    hasRings: true,
    ringColor: '#fbbf24',
    distanceLightYears: 1.44,
    visualTheme: {
      skyColor: '#0f0a04',
      horizonColor: '#2b1c09',
      groundColor: '#2b2114',
      fogColor: '#170e04',
      fogDensity: 0.026,
      ambientLightColor: '#fef08a',
      ambientLightIntensity: 0.85,
      sunColor: '#f59e0b',
      sunPosition: [20, 25, 10],
      particleColor: '#fbbf24',
      particleCount: 200,
      accentColor: '#d97706',
    },
    rules: {
      gravity: 9.8,
      moveSpeed: 6.5,
      jumpForce: 5.5,
      ambientSoundChord: ['A3', 'C#4', 'E4', 'G#4', 'B4'],
      specialEffect: 'Interlocking brass gear mechanisms turning in rhythm.',
    },
    landmark: {
      name: 'The Chronos Astrolabe',
      lore: 'Calculates the passage of dreams and synchronizes all world timeflows.',
      position: [0, 3, -10],
      actionPrompt: 'Wind the master escapement',
    },
    startingSpawn: [0, 0.0, 5],
    landingPadPosition: [0, 0.2, 6],
  },
};

export const UNIVERSE_SPACE_SCALE = 35;

export function getPlanetUniversePosition(planetId: PlanetId): [number, number, number] {
  const meta = PLANET_CATALOG[planetId];
  if (!meta) return [0, 0, 0];
  return [
    meta.celestialPosition[0] * UNIVERSE_SPACE_SCALE,
    meta.celestialPosition[1] * UNIVERSE_SPACE_SCALE,
    meta.celestialPosition[2] * UNIVERSE_SPACE_SCALE,
  ];
}

