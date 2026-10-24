import {
  PlanetId,
  WorldObject,
  FeedbackSubmission,
  ObjectType,
} from '@lucid/shared';

const LOCAL_STORAGE_PREFIX = 'lucid_mvp_objects_';
const FEEDBACK_STORAGE_KEY = 'lucid_mvp_feedback_drafts';

// Initial fallback seeds for local mode
const LOCAL_INITIAL_SEEDS: Partial<Record<PlanetId, WorldObject[]>> = {
  origin: [
    {
      objectId: 'local-seed-origin-1',
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
      objectId: 'local-seed-origin-2',
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
      objectId: 'local-seed-candy-1',
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
      objectId: 'local-seed-pixel-1',
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
      objectId: 'local-seed-nature-1',
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
      objectId: 'local-seed-glass-1',
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
      objectId: 'local-seed-abyss-1',
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

const getSafeStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
};

export class PersistenceManager {
  private apiUrl: string;

  constructor() {
    const envUrl = (import.meta.env.VITE_API_URL || '').trim();
    if (envUrl) {
      this.apiUrl = envUrl.replace(/\/+$/, '');
    } else if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    ) {
      this.apiUrl = 'http://localhost:4000';
    } else {
      // In production, default to relative origin so calls to /api/* are handled by host or Vercel proxy
      this.apiUrl = '';
    }
  }

  public getApiUrl(): string {
    return this.apiUrl;
  }

  // Load objects for a given planet
  public async loadObjects(
    planetId: PlanetId,
    isConnected: boolean
  ): Promise<WorldObject[]> {
    if (isConnected) {
      try {
        const res = await fetch(`${this.apiUrl}/api/worlds/${planetId}/objects`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.objects)) {
            return data.objects;
          }
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local storage', err);
      }
    }

    // Local mode fallback
    return this.getLocalObjects(planetId);
  }

  // Local Storage handlers
  public getLocalObjects(planetId: PlanetId): WorldObject[] {
    try {
      const raw = getSafeStorage().getItem(`${LOCAL_STORAGE_PREFIX}${planetId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    const seed = LOCAL_INITIAL_SEEDS[planetId] || [];
    this.saveLocalObjects(planetId, seed);
    return seed;
  }

  public saveLocalObjects(planetId: PlanetId, objects: WorldObject[]): void {
    try {
      getSafeStorage().setItem(
        `${LOCAL_STORAGE_PREFIX}${planetId}`,
        JSON.stringify(objects)
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  public addLocalObject(
    planetId: PlanetId,
    obj: Omit<WorldObject, 'objectId' | 'version' | 'createdAt' | 'updatedAt'>
  ): WorldObject {
    const list = this.getLocalObjects(planetId);
    const newObj: WorldObject = {
      ...obj,
      objectId: `local-${planetId}-${Math.random().toString(36).slice(2, 9)}`,
      locationId: planetId,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newObj);
    this.saveLocalObjects(planetId, list);
    return newObj;
  }

  public removeLocalObject(planetId: PlanetId, objectId: string): void {
    const list = this.getLocalObjects(planetId);
    const filtered = list.filter((o) => o.objectId !== objectId);
    this.saveLocalObjects(planetId, filtered);
  }

  public resetLocalPlanet(planetId: PlanetId): WorldObject[] {
    const seeds = LOCAL_INITIAL_SEEDS[planetId] || [];
    this.saveLocalObjects(planetId, seeds);
    return seeds;
  }

  // Feedback submissions — persists directly to MongoDB backend API
  public async submitFeedback(
    submission: Omit<FeedbackSubmission, 'id' | 'submittedAt'>
  ): Promise<{ success: boolean; isRemote: boolean; id?: string; error?: string }> {
    const baseUrl = this.apiUrl.replace(/\/+$/, '');
    const endpoint = `${baseUrl}/api/feedback`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(submission),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          `Server returned status ${res.status} with non-JSON response. Please verify backend service.`
        );
      }

      const data = await res.json();

      if (res.ok && data?.success) {
        return {
          success: true,
          isRemote: true,
          id: data.submissionId || data.submission?.id,
        };
      }

      const errorMessage =
        data?.error || `Server responded with status ${res.status}`;
      return {
        success: false,
        isRemote: false,
        error: errorMessage,
      };
    } catch (err: any) {
      console.error('Remote feedback transmission failed:', err?.message || err);
      return {
        success: false,
        isRemote: false,
        error: err?.message || 'Network request failed. Could not reach server.',
      };
    }
  }

  public getLocalFeedbackDrafts(): FeedbackSubmission[] {
    try {
      const raw = getSafeStorage().getItem(FEEDBACK_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const persistence = new PersistenceManager();
