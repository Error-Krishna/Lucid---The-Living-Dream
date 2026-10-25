import { describe, it, expect, beforeEach } from 'vitest';
import { PLANET_CATALOG, PlanetId, getPlanetUniversePosition } from '@lucid/shared';
import { useUniverseStore } from '../../stores/useUniverseStore.js';

describe('Flight Usability, Autopilot & Cockpit Refinements', () => {
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
    const store = useUniverseStore.getState();
    store.disengageAutopilot();
    store.stopGuidedExploration();
    store.setTargetPlanet(null);
  });

  describe('Autopilot Activation, Validation & State Machine', () => {
    it('gracefully fails to engage autopilot when no destination is selected', () => {
      const store = useUniverseStore.getState();
      store.setTargetPlanet(null);

      const engaged = store.engageAutopilot();
      expect(engaged).toBe(false);
      expect(useUniverseStore.getState().autopilot).toBe(false);
      expect(useUniverseStore.getState().navigationToast?.message).toContain('No destination selected');
    });

    it('successfully engages autopilot when a valid destination is selected', () => {
      const store = useUniverseStore.getState();
      store.setTargetPlanet('candyverse');

      const engaged = store.engageAutopilot();
      expect(engaged).toBe(true);

      const state = useUniverseStore.getState();
      expect(state.autopilot).toBe(true);
      expect(state.selectedTargetId).toBe('candyverse');
      expect(state.headingAssistance).toBe(true);
      expect(state.approachAssistance).toBe(true);
      expect(state.flightAssistanceLevel).toBe('autopilot');
      expect(state.autopilotPhase).toBe('aligning');
      expect(state.navigationToast?.message).toContain('Autopilot engaged');
    });

    it('immediately disengages autopilot and restores manual flight upon override without resetting position', () => {
      const store = useUniverseStore.getState();
      store.setTargetPlanet('pixel');
      store.engageAutopilot();

      // Set arbitrary physical position and velocity
      store.setSpacecraftPhysics([120, 45, -300], [0, 5, 80], { pitch: 0.1, yaw: 1.2, roll: 0 });

      // Simulate manual takeover
      store.disengageAutopilot('Manual control restored.');

      const state = useUniverseStore.getState();
      expect(state.autopilot).toBe(false);
      expect(state.autopilotPhase).toBe('idle');
      expect(state.flightAssistanceLevel).toBe('manual');

      // Spatial coordinates must be fully preserved!
      expect(state.spacecraftPosition).toEqual([120, 45, -300]);
      expect(state.spacecraftVelocity).toEqual([0, 5, 80]);
      expect(state.navigationToast?.message).toBe('Manual control restored.');
    });
  });

  describe('Three Flight Assistance Levels', () => {
    it('switches between Manual, Assisted, and Autopilot levels correctly', () => {
      const store = useUniverseStore.getState();
      store.setTargetPlanet('nature');

      // Mode B: Assisted
      store.setFlightAssistanceLevel('assisted');
      let state = useUniverseStore.getState();
      expect(state.flightAssistanceLevel).toBe('assisted');
      expect(state.headingAssistance).toBe(true);
      expect(state.approachAssistance).toBe(true);
      expect(state.autopilot).toBe(false);

      // Mode C: Autopilot
      store.setFlightAssistanceLevel('autopilot');
      state = useUniverseStore.getState();
      expect(state.flightAssistanceLevel).toBe('autopilot');
      expect(state.autopilot).toBe(true);

      // Mode A: Manual
      store.setFlightAssistanceLevel('manual');
      state = useUniverseStore.getState();
      expect(state.flightAssistanceLevel).toBe('manual');
      expect(state.autopilot).toBe(false);
      expect(state.headingAssistance).toBe(false);
      expect(state.approachAssistance).toBe(false);
    });
  });

  describe('Navigation Recovery & Nearest Planet Calculation', () => {
    it('correctly calculates the nearest charted planet from spatial coordinates', () => {
      const store = useUniverseStore.getState();

      // Position spacecraft near Candyverse (actual universe coords: [-840, 280, -630])
      store.setSpacecraftPhysics([-835, 285, -625], [0, 0, 0], { pitch: 0, yaw: 0, roll: 0 });

      const nearest = store.findNearestPlanet();
      expect(nearest).toBe('candyverse');
    });

    it('correctly identifies nearest planet when placed near Origin ([0, 0, 0])', () => {
      const store = useUniverseStore.getState();
      store.setSpacecraftPhysics([5, 2, -10], [0, 0, 0], { pitch: 0, yaw: 0, roll: 0 });

      const nearest = store.findNearestPlanet();
      expect(nearest).toBe('origin');
    });
  });

  describe('Guided Exploration Tour Mode', () => {
    it('starts guided exploration and activates autopilot toward target', () => {
      const store = useUniverseStore.getState();
      store.startGuidedExploration('glassia');

      const state = useUniverseStore.getState();
      expect(state.guidedExplorationState).toBe('navigating');
      expect(state.guidedExplorationDestination).toBe('glassia');
      expect(state.autopilot).toBe(true);
      expect(state.selectedTargetId).toBe('glassia');
    });

    it('pauses guided exploration on foot and suggests next destination upon takeoff', async () => {
      const store = useUniverseStore.getState();
      store.startGuidedExploration('candyverse');

      // Deploy landing gear and land at candyverse
      store.setGearDeployed(true);
      const landed = store.attemptLanding('candyverse', -4, 2);
      expect(landed).toBe(true);
      expect(useUniverseStore.getState().guidedExplorationState).toBe('awaiting-exploration');

      // Disembark craft
      await store.disembarkCraft();
      expect(useUniverseStore.getState().guidedExplorationState).toBe('paused');

      // Re-board and take off
      store.boardCraft();
      store.initiateTakeoff();
      expect(useUniverseStore.getState().guidedExplorationState).toBe('suggesting-next-destination');
    });

    it('suggests an unvisited planet rather than the current or already visited planet', () => {
      const store = useUniverseStore.getState();

      // Mark origin and candyverse as visited
      store.setSpacecraftPhysics([0, 0, 0], [0, 0, 0], { pitch: 0, yaw: 0, roll: 0 });
      const next = store.suggestNextGuidedPlanet();

      expect(next).toBeDefined();
      expect(next).not.toBe('origin'); // Origin is default active/visited
      expect(PLANET_CATALOG[next!]).toBeDefined();
    });
  });

  describe('Tactical Planet Radar Projection', () => {
    it('ensures all 10 planets produce finite spatial distances and projection angles', () => {
      const craftPos = [50, 10, -50];
      const planetIds = Object.keys(PLANET_CATALOG) as PlanetId[];

      expect(planetIds).toHaveLength(10);

      planetIds.forEach((pid) => {
        const pPos = getPlanetUniversePosition(pid);
        const dx = pPos[0] - craftPos[0];
        const dy = pPos[1] - craftPos[1];
        const dz = pPos[2] - craftPos[2];
        const dist = Math.hypot(dx, dy, dz);

        expect(Number.isFinite(dist)).toBe(true);
        expect(dist).toBeGreaterThan(0);
      });
    });

    it('spatially projects coordinates accurately across spacecraft headings', () => {
      // Test function matching TacticalPlanetRadar projection logic:
      const project = (dx: number, dz: number, yaw: number) => {
        const forwardDist = -dx * Math.sin(yaw) - dz * Math.cos(yaw);
        const rightDist = dx * Math.cos(yaw) - dz * Math.sin(yaw);
        return { forwardDist, rightDist };
      };

      // 1. Heading = 0 (facing -Z). Planet is at (0, 0, -100) (straight ahead).
      const p1 = project(0, -100, 0);
      expect(p1.forwardDist).toBeCloseTo(100, 1);
      expect(p1.rightDist).toBeCloseTo(0, 1);

      // 2. Heading = +PI/2 (turned 90 deg left to face -X). Planet at (0, 0, -100) should now be on the right.
      const p2 = project(0, -100, Math.PI / 2);
      expect(p2.forwardDist).toBeCloseTo(0, 1);
      expect(p2.rightDist).toBeCloseTo(100, 1);

      // 3. Heading = -PI/2 (turned 90 deg right to face +X). Planet at (100, 0, 0) should be directly ahead.
      const p3 = project(100, 0, -Math.PI / 2);
      expect(p3.forwardDist).toBeCloseTo(100, 1);
      expect(p3.rightDist).toBeCloseTo(0, 1);

      // 4. Heading = PI (turned 180 deg, facing +Z). Planet at (0, 0, -100) should be behind (negative forward).
      const p4 = project(0, -100, Math.PI);
      expect(p4.forwardDist).toBeCloseTo(-100, 1);
      expect(p4.rightDist).toBeCloseTo(0, 1);
    });
  });
});
