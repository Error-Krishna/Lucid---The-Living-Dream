export interface FlightEffectsConfig {
  maxStreakIntensity: number;
  baseParticleCount: number;
  dustParticleCount: number;
  maxSpeedReference: number; // km/s for normalizing speedRatio (0 to 1)
  warpSpeedThreshold: number; // speed at which warp streaks emerge
  streakMinLength: number;
  streakMaxLength: number;
  particleSpread: [number, number, number];
  particleSpeedMultiplier: number;
  visualDampingFactor: number;
  motionReduced: boolean;
}

export const DEFAULT_FLIGHT_EFFECTS_CONFIG: FlightEffectsConfig = {
  maxStreakIntensity: 1.0,
  baseParticleCount: 1200,
  dustParticleCount: 400,
  maxSpeedReference: 160, // normal top cruising speed
  warpSpeedThreshold: 35, // streaks start becoming visible above 35 km/s
  streakMinLength: 0.1,
  streakMaxLength: 4.8,
  particleSpread: [120, 80, 160], // bounding box around cockpit
  particleSpeedMultiplier: 1.4,
  visualDampingFactor: 4.5,
  motionReduced: false,
};
