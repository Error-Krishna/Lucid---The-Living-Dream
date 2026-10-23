import { describe, it, expect, beforeEach } from 'vitest';
import { useUniverseStore } from './useUniverseStore.js';
import { PLANET_CATALOG } from '@lucid/shared';

describe('useUniverseStore & World-Building', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('initializes with default state in first-person cockpit and origin planet', () => {
    const state = useUniverseStore.getState();
    expect(state.viewMode).toBe('cockpit');
    expect(state.activePlanet).toBe('origin');
    expect(PLANET_CATALOG[state.activePlanet]).toBeDefined();
  });

  it('supports entering world and toggling build mode', () => {
    const store = useUniverseStore.getState();
    expect(store.isBuildMode).toBe(false);

    store.toggleBuildMode();
    expect(useUniverseStore.getState().isBuildMode).toBe(true);

    store.toggleBuildMode();
    expect(useUniverseStore.getState().isBuildMode).toBe(false);
  });

  it('places an object and retrieves it with correct coordinates and persistence metadata', () => {
    const store = useUniverseStore.getState();
    store.setSelectedTool('resonant_crystal');
    store.setPaletteColor('#38bdf8');

    const created = store.placeObjectAt([2, 1, -4]);
    expect(created.objectId).toBeDefined();
    expect(created.type).toBe('resonant_crystal');
    expect(created.transform.position).toEqual([2, 1, -4]);

    const objects = useUniverseStore.getState().objects;
    expect(objects.some((o) => o.objectId === created.objectId)).toBe(true);
  });

  it('removes selected object properly', () => {
    const store = useUniverseStore.getState();
    const created = store.placeObjectAt([5, 1, -2]);

    store.setSelectedObject(created);
    expect(useUniverseStore.getState().selectedObject?.objectId).toBe(created.objectId);

    store.removeSelectedObject();
    expect(useUniverseStore.getState().selectedObject).toBeNull();
    expect(
      useUniverseStore
        .getState()
        .objects.some((o) => o.objectId === created.objectId)
    ).toBe(false);
  });

  it('sets target planet reference without teleporting the spacecraft position', () => {
    const store = useUniverseStore.getState();
    const initialPos = [...store.spacecraftPosition] as [number, number, number];

    store.setTargetPlanet('pixel');
    const state = useUniverseStore.getState();

    expect(state.selectedTargetId).toBe('pixel');
    expect(state.spacecraftPosition).toEqual(initialPos); // MUST NOT TELEPORT
  });

  it('scans and discovers nearby celestial bodies within scanner range', () => {
    const store = useUniverseStore.getState();
    // Craft near Origin (0, 8, 48)
    store.pulseScanner();
    const state = useUniverseStore.getState();

    // Origin is always discovered, and nearby planets within 1800 units get discovered
    expect(state.discoveredPlanets['origin']).toBe(true);
    // Candyverse is ~1200 units away from Origin, so it should be discovered
    expect(state.discoveredPlanets['candyverse']).toBe(true);
  });

  it('validates manual landing: rejects unsafe speed or retracted gear, accepts safe conditions', () => {
    const store = useUniverseStore.getState();

    // 1. Unsafe: Gear retracted
    store.setGearDeployed(false);
    const resultNoGear = store.attemptLanding('origin', -5, 4);
    expect(resultNoGear).toBe(false);
    expect(useUniverseStore.getState().landingState).toBe('failed');

    // 2. Unsafe: Excessive descent speed (> 14.5 m/s)
    store.setGearDeployed(true);
    const resultTooFast = store.attemptLanding('origin', -28, 5);
    expect(resultTooFast).toBe(false);
    expect(useUniverseStore.getState().landingState).toBe('failed');

    // 3. Safe: Gear deployed, vertical speed safe, horizontal speed safe
    const resultSafe = store.attemptLanding('origin', -6, 4);
    expect(resultSafe).toBe(true);
    expect(useUniverseStore.getState().landingState).toBe('touchdown');
    expect(useUniverseStore.getState().flightMode).toBe('landed');
  });

  it('supports manual takeoff from surface back into spaceflight', () => {
    const store = useUniverseStore.getState();
    store.boardCraft();
    expect(useUniverseStore.getState().flightMode).toBe('landed');

    store.initiateTakeoff();
    expect(useUniverseStore.getState().takeoffState).toBe('liftoff');
  });

  it('controls flight assistance modes and interactive pilot tutorial states', () => {
    const store = useUniverseStore.getState();

    // Initial default state
    expect(store.headingAssistance).toBe(false);
    expect(store.approachAssistance).toBe(false);
    expect(store.flightTutorialStep).toBe(0);
    expect(store.isTutorialVisible).toBe(true);

    // Toggle Heading Assistance
    store.toggleHeadingAssistance();
    expect(useUniverseStore.getState().headingAssistance).toBe(true);
    store.toggleHeadingAssistance();
    expect(useUniverseStore.getState().headingAssistance).toBe(false);

    // Toggle Approach Assistance
    store.toggleApproachAssistance();
    expect(useUniverseStore.getState().approachAssistance).toBe(true);
    store.toggleApproachAssistance();
    expect(useUniverseStore.getState().approachAssistance).toBe(false);

    // Pilot Tutorial Navigation
    store.setFlightTutorialStep(3);
    expect(useUniverseStore.getState().flightTutorialStep).toBe(3);

    store.setIsTutorialVisible(false);
    expect(useUniverseStore.getState().isTutorialVisible).toBe(false);
  });
});
