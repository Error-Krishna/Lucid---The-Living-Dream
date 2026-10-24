import { describe, it, expect, beforeEach } from 'vitest';
import { PLANET_CATALOG, PlanetId } from '@lucid/shared';
import { FLIGHT_SENSITIVITY_PRESETS } from './flightSensitivityConfig';
import { DEFAULT_FLIGHT_EFFECTS_CONFIG } from './flightEffectsConfig';
import { useUniverseStore } from '../../stores/useUniverseStore';

describe('Flight Realism, Narratives & Onboarding Enhancements', () => {
  const mockStorage: Record<string, string> = {};
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = String(val);
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const k in mockStorage) delete mockStorage[k];
      },
      length: 0,
      key: () => null,
    };
  }

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  describe('Planet Narratives & Project Vision', () => {
    const requiredPlanets: PlanetId[] = [
      'origin',
      'candyverse',
      'pixel',
      'nature',
      'glassia',
      'abyss',
      'zephyr',
      'ignis',
      'astraea',
      'chronos',
    ];

    it('defines narrative metadata for all 10 chartered planets', () => {
      requiredPlanets.forEach((pid) => {
        const meta = PLANET_CATALOG[pid];
        expect(meta, `Planet ${pid} should exist`).toBeDefined();
        expect(meta.narrative, `Planet ${pid} must have narrative definition`).toBeDefined();
        expect(meta.narrative?.theme).toBeTruthy();
        expect(meta.narrative?.fictionalDescription).toBeTruthy();
        expect(meta.narrative?.projectVision).toBeTruthy();
        expect(meta.narrative?.suggestedActivity).toBeTruthy();
      });
    });

    it('preserves celestial positions and radii across all 10 planets', () => {
      requiredPlanets.forEach((pid) => {
        const meta = PLANET_CATALOG[pid];
        expect(meta.celestialPosition).toHaveLength(3);
        expect(meta.radius).toBeGreaterThan(1);
      });
    });
  });

  describe('Flight Sensitivity Settings', () => {
    it('provides default, smooth, and agile presets with calibrated parameters', () => {
      const presets = ['default', 'smooth', 'agile'] as const;

      presets.forEach((preset) => {
        const config = FLIGHT_SENSITIVITY_PRESETS[preset];
        expect(config.mouseSensitivity).toBeGreaterThan(0);
        expect(config.yawTurnRate).toBeGreaterThan(0);
        expect(config.pitchClampRad).toBeCloseTo(1.45, 2);
        expect(config.thrustAcceleration).toBeGreaterThan(50);
        expect(config.boostMultiplier).toBeGreaterThan(1);
      });

      // Smooth should have lower mouse sensitivity than default, and agile should be higher
      expect(FLIGHT_SENSITIVITY_PRESETS.smooth.mouseSensitivity).toBeLessThan(
        FLIGHT_SENSITIVITY_PRESETS.default.mouseSensitivity
      );
      expect(FLIGHT_SENSITIVITY_PRESETS.agile.mouseSensitivity).toBeGreaterThan(
        FLIGHT_SENSITIVITY_PRESETS.default.mouseSensitivity
      );
    });

    it('updates flight sensitivity preset in store and updates localStorage', () => {
      const store = useUniverseStore.getState();
      expect(store.flightSensitivity).toBe('default');

      store.setFlightSensitivity('smooth');
      expect(useUniverseStore.getState().flightSensitivity).toBe('smooth');
      expect(localStorage.getItem('lucid_flight_sensitivity')).toBe('smooth');

      store.setFlightSensitivity('agile');
      expect(useUniverseStore.getState().flightSensitivity).toBe('agile');
      expect(localStorage.getItem('lucid_flight_sensitivity')).toBe('agile');
    });
  });

  describe('Flight Effects Configuration', () => {
    it('defines speed threshold and streak intensity limits', () => {
      expect(DEFAULT_FLIGHT_EFFECTS_CONFIG.warpSpeedThreshold).toBe(35);
      expect(DEFAULT_FLIGHT_EFFECTS_CONFIG.maxStreakIntensity).toBe(1.0);
      expect(DEFAULT_FLIGHT_EFFECTS_CONFIG.baseParticleCount).toBeGreaterThan(500);
      expect(DEFAULT_FLIGHT_EFFECTS_CONFIG.streakMaxLength).toBeGreaterThan(
        DEFAULT_FLIGHT_EFFECTS_CONFIG.streakMinLength
      );
    });
  });

  describe('Onboarding & Tutorial State Machine', () => {
    it('supports opening, closing, and persisting intro status', () => {
      const store = useUniverseStore.getState();
      store.setIntroOpen(false);

      expect(useUniverseStore.getState().isIntroOpen).toBe(false);
      expect(localStorage.getItem('lucid_intro_seen_v1')).toBe('true');

      store.setIntroOpen(true);
      expect(useUniverseStore.getState().isIntroOpen).toBe(true);
    });

    it('supports restarting the flight tutorial to step 0', () => {
      const store = useUniverseStore.getState();
      store.setFlightTutorialStep(5);
      store.setIsTutorialVisible(false);

      expect(useUniverseStore.getState().flightTutorialStep).toBe(5);
      expect(useUniverseStore.getState().isTutorialVisible).toBe(false);

      store.restartTutorial();
      expect(useUniverseStore.getState().flightTutorialStep).toBe(0);
      expect(useUniverseStore.getState().isTutorialVisible).toBe(true);
    });
  });
});
