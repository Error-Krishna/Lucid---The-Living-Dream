import {
  PlanetId,
  WorldObject,
  FeedbackSubmission,
  EnvironmentState,
  PLANET_CATALOG,
  ObjectType,
} from '@lucid/shared';
import crypto from 'node:crypto';

// Seed initial objects for atmosphere and exploration
const INITIAL_OBJECTS: Partial<Record<PlanetId, WorldObject[]>> = {
  origin: [
    {
      objectId: 'obj-origin-1',
      locationId: 'origin',
      creatorId: 'arch-001',
      creatorName: 'The Architect',
      type: 'dream_beacon',
      transform: {
        position: [-4, 0.8, -4],
        rotation: [0, 0.5, 0],
        scale: [1, 1, 1],
      },
      appearance: {
        color: '#818cf8',
        emissive: '#6366f1',
        emissiveIntensity: 1.2,
      },
      permissions: 'public',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      objectId: 'obj-origin-2',
      locationId: 'origin',
      creatorId: 'arch-001',
      creatorName: 'The Architect',
      type: 'resonant_crystal',
      transform: {
        position: [4, 1.2, -5],
        rotation: [0.2, -0.4, 0.1],
        scale: [1.2, 1.5, 1.2],
      },
      appearance: {
        color: '#c084fc',
        emissive: '#a855f7',
        emissiveIntensity: 1.0,
      },
      permissions: 'public',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  candyverse: [
    {
      objectId: 'obj-candy-1',
      locationId: 'candyverse',
      creatorId: 'wanderer-007',
      creatorName: 'The Wanderer',
      type: 'dream_beacon',
      transform: {
        position: [-3, 0.9, -6],
        rotation: [0, 0, 0],
        scale: [1.1, 1.1, 1.1],
      },
      appearance: {
        color: '#f472b6',
        emissive: '#ec4899',
        emissiveIntensity: 1.3,
      },
      permissions: 'public',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  pixel: [
    {
      objectId: 'obj-pixel-1',
      locationId: 'pixel',
      creatorId: 'arch-001',
      creatorName: 'The Architect',
      type: 'star_monolith',
      transform: {
        position: [3, 1.5, -4],
        rotation: [0, 0, 0],
        scale: [1, 2, 1],
      },
      appearance: {
        color: '#34d399',
        emissive: '#10b981',
        emissiveIntensity: 1.1,
      },
      permissions: 'public',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  nature: [
    {
      objectId: 'obj-nature-1',
      locationId: 'nature',
      creatorId: 'wanderer-007',
      creatorName: 'The Wanderer',
      type: 'bioluminescent_flora',
      transform: {
        position: [-3.5, 0.5, -5],
        rotation: [0, 1.2, 0],
        scale: [1.3, 1.3, 1.3],
      },
      appearance: {
        color: '#4ade80',
        emissive: '#22c55e',
        emissiveIntensity: 1.2,
      },
      permissions: 'public',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  glassia: [
    {
      objectId: 'obj-glass-1',
      locationId: 'glassia',
      creatorId: 'arch-001',
      creatorName: 'The Architect',
      type: 'resonant_crystal',
      transform: {
        position: [3.5, 1.2, -6],
        rotation: [0.3, 0.8, 0],
        scale: [1.4, 2.0, 1.4],
      },
      appearance: {
        color: '#38bdf8',
        emissive: '#0ea5e9',
        emissiveIntensity: 1.4,
      },
      permissions: 'public',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  abyss: [
    {
      objectId: 'obj-abyss-1',
      locationId: 'abyss',
      creatorId: 'wanderer-007',
      creatorName: 'The Wanderer',
      type: 'bioluminescent_flora',
      transform: {
        position: [-3, 1.0, -5],
        rotation: [0, 0.4, 0],
        scale: [1.2, 1.8, 1.2],
      },
      appearance: {
        color: '#2dd4bf',
        emissive: '#14b8a6',
        emissiveIntensity: 1.5,
      },
      permissions: 'public',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export class WorldStore {
  private objects: Map<PlanetId, Map<string, WorldObject>> = new Map();
  private feedbackSubmissions: FeedbackSubmission[] = [];
  private environments: Map<PlanetId, EnvironmentState> = new Map();

  constructor() {
    this.initDefaultData();
  }

  private initDefaultData(): void {
    const planets: PlanetId[] = [
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
    for (const planet of planets) {
      this.objects.set(planet, new Map());
      this.environments.set(planet, {
        transformationActive: false,
        transformationType: undefined,
        cycleTime: 0.2,
      });

      const seedList = INITIAL_OBJECTS[planet] || [];
      for (const obj of seedList) {
        this.objects.get(planet)!.set(obj.objectId, { ...obj });
      }
    }
  }

  public getObjects(planetId: PlanetId): WorldObject[] {
    const map = this.objects.get(planetId);
    if (!map) return [];
    return Array.from(map.values());
  }

  public getObject(planetId: PlanetId, objectId: string): WorldObject | undefined {
    return this.objects.get(planetId)?.get(objectId);
  }

  public createObject(
    planetId: PlanetId,
    data: Omit<WorldObject, 'objectId' | 'version' | 'createdAt' | 'updatedAt'>
  ): WorldObject {
    const map = this.objects.get(planetId);
    if (!map) {
      throw new Error(`Planet ${planetId} does not exist`);
    }

    const objectId = `obj-${planetId}-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newObj: WorldObject = {
      objectId,
      locationId: planetId,
      creatorId: data.creatorId || 'anonymous-dreamer',
      creatorName: data.creatorName || 'Anonymous Dreamer',
      type: data.type,
      transform: {
        position: [
          Math.max(-80, Math.min(80, data.transform.position[0])),
          Math.max(-20, Math.min(50, data.transform.position[1])),
          Math.max(-80, Math.min(80, data.transform.position[2])),
        ],
        rotation: data.transform.rotation || [0, 0, 0],
        scale: [
          Math.max(0.2, Math.min(8, data.transform.scale[0] || 1)),
          Math.max(0.2, Math.min(8, data.transform.scale[1] || 1)),
          Math.max(0.2, Math.min(8, data.transform.scale[2] || 1)),
        ],
      },
      appearance: data.appearance || { color: '#ffffff' },
      permissions: data.permissions || 'public',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    map.set(objectId, newObj);
    return newObj;
  }

  public updateObject(
    planetId: PlanetId,
    objectId: string,
    updates: {
      transform?: Partial<WorldObject['transform']>;
      appearance?: Partial<WorldObject['appearance']>;
      version?: number;
    }
  ): WorldObject {
    const map = this.objects.get(planetId);
    if (!map) throw new Error(`Planet ${planetId} does not exist`);

    const existing = map.get(objectId);
    if (!existing) throw new Error(`Object ${objectId} not found`);

    if (updates.transform) {
      existing.transform = {
        position: updates.transform.position || existing.transform.position,
        rotation: updates.transform.rotation || existing.transform.rotation,
        scale: updates.transform.scale || existing.transform.scale,
      };
    }

    if (updates.appearance) {
      existing.appearance = {
        ...existing.appearance,
        ...updates.appearance,
      };
    }

    existing.version += 1;
    existing.updatedAt = new Date().toISOString();

    map.set(objectId, existing);
    return existing;
  }

  public deleteObject(planetId: PlanetId, objectId: string): boolean {
    const map = this.objects.get(planetId);
    if (!map) return false;
    return map.delete(objectId);
  }

  public getEnvironment(planetId: PlanetId): EnvironmentState {
    return (
      this.environments.get(planetId) || {
        transformationActive: false,
        cycleTime: 0.5,
      }
    );
  }

  public setEnvironmentTransformation(
    planetId: PlanetId,
    active: boolean,
    type?: string
  ): EnvironmentState {
    const current = this.getEnvironment(planetId);
    const updated: EnvironmentState = {
      ...current,
      transformationActive: active,
      transformationType: type,
    };
    this.environments.set(planetId, updated);
    return updated;
  }

  public addFeedback(
    feedback: Omit<FeedbackSubmission, 'id' | 'submittedAt'>
  ): FeedbackSubmission {
    const newSubmission: FeedbackSubmission = {
      ...feedback,
      id: `fb-${crypto.randomUUID().slice(0, 10)}`,
      submittedAt: new Date().toISOString(),
      isLocal: false,
    };
    this.feedbackSubmissions.push(newSubmission);
    return newSubmission;
  }

  public getFeedback(): FeedbackSubmission[] {
    return [...this.feedbackSubmissions];
  }

  public getStats() {
    let totalObjects = 0;
    this.objects.forEach((m) => {
      totalObjects += m.size;
    });
    return {
      totalWorlds: this.objects.size,
      totalObjects,
      totalFeedback: this.feedbackSubmissions.length,
    };
  }
}

export const worldStore = new WorldStore();
