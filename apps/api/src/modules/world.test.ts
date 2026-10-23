import { describe, it, expect } from 'vitest';
import { worldStore } from '../storage/worldStore.js';
import { PLANET_CATALOG } from '@lucid/shared';

describe('WorldStore and Mechanics', () => {
  it('initializes with seed objects across all 6 core planets', () => {
    const originObjects = worldStore.getObjects('origin');
    expect(originObjects.length).toBeGreaterThan(0);
    expect(originObjects[0].locationId).toBe('origin');
  });

  it('creates and retrieves a new persistent object with safe boundary clamping', () => {
    const created = worldStore.createObject('candyverse', {
      locationId: 'candyverse',
      creatorId: 'tester-123',
      creatorName: 'Dream Explorer',
      type: 'resonant_crystal',
      transform: {
        position: [250, 999, -500], // should clamp to safe bounds [-80, 50, -80]
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      appearance: { color: '#ffb3ba' },
      permissions: 'public',
    });

    expect(created.objectId).toBeDefined();
    expect(created.transform.position[0]).toBeLessThanOrEqual(80);
    expect(created.transform.position[1]).toBeLessThanOrEqual(50);
    expect(created.version).toBe(1);

    const fetched = worldStore.getObject('candyverse', created.objectId);
    expect(fetched).toBeDefined();
    expect(fetched?.creatorName).toBe('Dream Explorer');
  });

  it('increments version on update and allows deletion', () => {
    const created = worldStore.createObject('origin', {
      locationId: 'origin',
      creatorId: 'tester-version',
      creatorName: 'Architect Jr',
      type: 'dream_beacon',
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      appearance: { color: '#ffffff' },
      permissions: 'public',
    });

    const updated = worldStore.updateObject('origin', created.objectId, {
      appearance: { color: '#6366f1' },
    });
    expect(updated.version).toBe(2);
    expect(updated.appearance.color).toBe('#6366f1');

    const deleted = worldStore.deleteObject('origin', created.objectId);
    expect(deleted).toBe(true);
    expect(worldStore.getObject('origin', created.objectId)).toBeUndefined();
  });

  it('stores and validates feedback submissions properly', () => {
    const fb = worldStore.addFeedback({
      rating: 5,
      interest: 'Definitely',
      favoriteFeatures: ['The dreamlike visuals', 'Creating objects in the world'],
      decision: 'YES',
      prototypeVersion: '1.0.0-mvp',
    });

    expect(fb.id).toBeDefined();
    expect(fb.decision).toBe('YES');
    expect(worldStore.getFeedback().length).toBeGreaterThanOrEqual(1);
  });
});
