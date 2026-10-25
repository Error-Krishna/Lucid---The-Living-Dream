import { create } from 'zustand';
import {
  PlanetId,
  WorldObject,
  AvatarPresence,
  AvatarConfig,
  ObjectType,
  EnvironmentState,
  ChatMessage,
  TravelState,
  PLANET_CATALOG,
  getPlanetUniversePosition,
} from '@lucid/shared';
import { persistence } from '../lib/persistence.js';
import { soundEngine } from '../lib/sound.js';

export type ViewMode = 'cockpit' | 'world' | 'universe' | 'landing';
export type ConnectionMode = 'connected' | 'local' | 'connecting' | 'offline';

export type FlightMode =
  | 'cockpit'
  | 'spaceflight'
  | 'atmospheric_entry'
  | 'descent'
  | 'landed'
  | 'on_foot';

export type LandingState = 'none' | 'aligning' | 'descending' | 'touchdown' | 'failed';
export type TakeoffState = 'grounded' | 'spooling' | 'liftoff' | 'airborne';

export interface DiscoveryRecord {
  id: string;
  title: string;
  category: 'fauna' | 'flora' | 'landmark' | 'lore';
  description: string;
  timestamp: number;
}

const getSafeStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    // Restricted environment or private browsing mode
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
};

interface UniverseState {
  // Navigation & Travel State Machine
  viewMode: ViewMode;
  travelState: TravelState;
  activePlanet: PlanetId;
  selectedDestination: PlanetId | null;
  visitedPlanets: Record<string, boolean>;
  isTransitioning: boolean;
  transitionMessage: string;
  isNearRocket: boolean;

  // Physical Spacecraft State
  selectedTargetId: PlanetId | null;
  spacecraftPosition: [number, number, number];
  spacecraftVelocity: [number, number, number];
  spacecraftOrientation: { pitch: number; yaw: number; roll: number };
  flightMode: FlightMode;
  landingState: LandingState;
  takeoffState: TakeoffState;
  gearDeployed: boolean;
  landingAssistance: boolean;
  headingAssistance: boolean;
  approachAssistance: boolean;
  flightTutorialStep: number;
  isTutorialVisible: boolean;
  isScanning: boolean;
  discoveredPlanets: Partial<Record<PlanetId, boolean>>;
  throttle: number;
  radarAltitude: number;
  landingFeedback: string | null;

  // Autopilot & Flight Guidance
  autopilot: boolean;
  autopilotPhase: 'idle' | 'aligning' | 'cruising' | 'approaching' | 'arrival-hold' | 'landing';
  flightAssistanceLevel: 'manual' | 'assisted' | 'autopilot';
  setAutopilot: (active: boolean) => void;
  toggleAutopilot: () => boolean;
  setAutopilotPhase: (
    phase: 'idle' | 'aligning' | 'cruising' | 'approaching' | 'arrival-hold' | 'landing'
  ) => void;
  setFlightAssistanceLevel: (level: 'manual' | 'assisted' | 'autopilot') => void;
  engageAutopilot: (targetPlanetId?: PlanetId) => boolean;
  disengageAutopilot: (reason?: string) => void;

  // Guided Exploration Tour
  guidedExplorationState:
    | 'idle'
    | 'selecting-destination'
    | 'navigating'
    | 'approaching'
    | 'awaiting-exploration'
    | 'suggesting-next-destination'
    | 'paused'
    | 'manual-override'
    | 'completed'
    | 'error';
  guidedExplorationDestination: PlanetId | null;
  guidedExplorationAutoSuggest: boolean;
  guidedExplorationStopForExploration: boolean;
  startGuidedExploration: (startingPlanetId?: PlanetId) => void;
  stopGuidedExploration: () => void;
  pauseGuidedExploration: () => void;
  resumeGuidedExploration: () => void;
  suggestNextGuidedPlanet: () => PlanetId | null;
  setGuidedExplorationState: (
    state:
      | 'idle'
      | 'selecting-destination'
      | 'navigating'
      | 'approaching'
      | 'awaiting-exploration'
      | 'suggesting-next-destination'
      | 'paused'
      | 'manual-override'
      | 'completed'
      | 'error'
  ) => void;

  // Navigation Feedback & Recovery
  navigationToast: {
    id: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    actionLabel?: string;
    onAction?: () => void;
  } | null;
  showNavigationToast: (
    message: string,
    opts?: {
      type?: 'info' | 'success' | 'warning' | 'error';
      actionLabel?: string;
      onAction?: () => void;
    }
  ) => void;
  clearNavigationToast: () => void;
  isRecoveryModalOpen: boolean;
  setRecoveryModalOpen: (open: boolean) => void;
  findNearestPlanet: () => PlanetId;
  isAutopilotHintDismissed: boolean;
  dismissAutopilotHint: () => void;

  // Physical Spacecraft Actions
  setSpacecraftPhysics: (
    pos: [number, number, number],
    vel: [number, number, number],
    orientation: { pitch: number; yaw: number; roll: number }
  ) => void;
  setThrottle: (throttle: number) => void;
  setRadarAltitude: (alt: number) => void;
  toggleGear: () => boolean;
  setGearDeployed: (deployed: boolean) => void;
  toggleLandingAssistance: () => boolean;
  toggleHeadingAssistance: () => boolean;
  toggleApproachAssistance: () => boolean;
  setFlightTutorialStep: (step: number) => void;
  setIsTutorialVisible: (visible: boolean) => void;
  setFlightMode: (mode: FlightMode) => void;
  setLandingState: (state: LandingState, feedback?: string | null) => void;
  setTakeoffState: (state: TakeoffState) => void;
  setTargetPlanet: (planetId: PlanetId | null) => void;
  pulseScanner: () => void;
  attemptLanding: (planetId: PlanetId, verticalSpeed: number, horizontalSpeed: number) => boolean;
  disembarkCraft: () => Promise<void>;
  boardCraft: () => void;
  initiateTakeoff: () => void;

  // Connection & User
  connectionMode: ConnectionMode;
  userId: string;
  userName: string;
  avatarConfig: AvatarConfig;
  soundEnabled: boolean;

  // World State
  objects: WorldObject[];
  presences: AvatarPresence[];
  environment: EnvironmentState;

  // Interactions & Landmarks
  contextPrompt: string | null;
  activeLandmark: (typeof PLANET_CATALOG)['origin']['landmark'] | null;
  nearbyPortal: PlanetId | null;

  // Building System
  isBuildMode: boolean;
  selectedTool: ObjectType;
  paletteColor: string;
  selectedObject: WorldObject | null;

  // Modals & Panels
  isFeedbackOpen: boolean;
  isFinishExplorationOpen: boolean;
  isHelpOpen: boolean;
  isMapOpen: boolean;
  isChatOpen: boolean;
  isProfileOpen: boolean;
  chatMessages: ChatMessage[];

  // Discoveries & Field Journal
  discoveries: DiscoveryRecord[];
  activeDiscoveryNotice: DiscoveryRecord | null;
  addDiscovery: (title: string, category: 'fauna' | 'flora' | 'landmark' | 'lore', description: string) => void;
  dismissDiscoveryNotice: () => void;

  // Actions
  enterUniverseView: () => void;
  selectDestination: (planetId: PlanetId) => void;
  clearDestination: () => void;
  cycleTargetPlanet: (direction?: 1 | -1) => PlanetId;
  initiateTravel: (targetPlanet?: PlanetId) => Promise<void>;
  travelToPlanet: (planetId: PlanetId) => Promise<void>;
  completeLanding: () => void;
  boardRocket: () => void;
  completeTakeoff: () => void;
  exitToLanding: () => void;

  // General controls
  setConnectionMode: (mode: ConnectionMode) => void;
  setUserName: (name: string) => void;
  setAvatarConfig: (config: Partial<AvatarConfig>) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setContextPrompt: (prompt: string | null, portalTarget?: PlanetId | null) => void;
  setIsNearRocket: (near: boolean) => void;
  triggerLandmarkInteraction: () => void;
  closeLandmarkModal: () => void;

  // Building actions
  toggleBuildMode: () => void;
  setSelectedTool: (tool: ObjectType) => void;
  setPaletteColor: (color: string) => void;
  setSelectedObject: (obj: WorldObject | null) => void;
  placeObjectAt: (position: [number, number, number], rotation?: [number, number, number]) => WorldObject;
  removeSelectedObject: () => void;
  resetCurrentPlanet: () => void;

  // Multiplayer sync helpers
  setSnapshot: (objects: WorldObject[], presences: AvatarPresence[], env: EnvironmentState) => void;
  addRemoteObject: (object: WorldObject) => void;
  updateRemoteObject: (object: WorldObject) => void;
  removeRemoteObject: (objectId: string) => void;
  addOrUpdatePresence: (presence: AvatarPresence) => void;
  removePresence: (sessionId: string) => void;
  updatePresenceTransform: (
    sessionId: string,
    position: [number, number, number],
    rotation: [number, number, number],
    emote: any
  ) => void;
  setEnvironmentState: (env: EnvironmentState) => void;
  addChatMessage: (msg: ChatMessage) => void;

  // Modals
  setFeedbackOpen: (open: boolean) => void;
  openFinishExploration: () => void;
  closeFinishExploration: () => void;
  setHelpOpen: (open: boolean) => void;
  setMapOpen: (open: boolean) => void;
  toggleMap: () => void;
  setChatOpen: (open: boolean) => void;
  setProfileOpen: (open: boolean) => void;

  // Introduction & Onboarding
  isIntroOpen: boolean;
  setIntroOpen: (open: boolean) => void;
  flightSensitivity: 'default' | 'smooth' | 'agile';
  setFlightSensitivity: (preset: 'default' | 'smooth' | 'agile') => void;
  restartTutorial: () => void;
}

const DEFAULT_AVATAR: AvatarConfig = {
  color: '#818cf8',
  glowColor: '#6366f1',
  style: 'wanderer',
};

export const useUniverseStore = create<UniverseState>((set, get) => {
  const storage = getSafeStorage();
  const savedName = storage.getItem('lucid_user_name') || 'Wanderer';
  const savedUserId =
    storage.getItem('lucid_user_id') ||
    `user-${Math.random().toString(36).slice(2, 8)}`;
  storage.setItem('lucid_user_id', savedUserId);

  let initialVisited: Record<string, boolean> = { origin: true };
  try {
    const rawVisited = storage.getItem('lucid_visited_planets');
    if (rawVisited) {
      initialVisited = JSON.parse(rawVisited);
    }
  } catch {}

  return {
    viewMode: 'cockpit',
    travelState: 'universe',
    activePlanet: 'origin',
    selectedDestination: null,
    visitedPlanets: initialVisited,
    isTransitioning: false,
    transitionMessage: '',
    isNearRocket: false,

    // Connection & User
    connectionMode: 'connecting',
    userId: savedUserId,
    userName: savedName,
    avatarConfig: DEFAULT_AVATAR,
    soundEnabled: false,

    // World State
    objects: [],
    presences: [],
    environment: {
      transformationActive: false,
      cycleTime: 0.3,
    },

    // Interactions & Landmarks
    contextPrompt: null,
    activeLandmark: null,
    nearbyPortal: null,

    // Building System
    isBuildMode: false,
    selectedTool: 'dream_beacon',
    paletteColor: '#818cf8',
    selectedObject: null,

    // Modals & Panels
    isFeedbackOpen: false,
    isFinishExplorationOpen: false,
    isHelpOpen: false,
    isMapOpen: false,
    isChatOpen: false,
    isProfileOpen: false,
    chatMessages: [],

    // Discoveries & Field Journal
    discoveries: [],
    activeDiscoveryNotice: null,
    addDiscovery: (title, category, description) => {
      const exists = get().discoveries.some((d) => d.title === title);
      const newRec: DiscoveryRecord = {
        id: `disc-${Date.now()}`,
        title,
        category,
        description,
        timestamp: Date.now(),
      };
      soundEngine.playDiscoveryChime();
      set({
        discoveries: exists ? get().discoveries : [...get().discoveries, newRec],
        activeDiscoveryNotice: newRec,
      });
      setTimeout(() => {
        if (get().activeDiscoveryNotice?.id === newRec.id) {
          set({ activeDiscoveryNotice: null });
        }
      }, 4500);
    },
    dismissDiscoveryNotice: () => set({ activeDiscoveryNotice: null }),

    // Physical Spacecraft State
    selectedTargetId: null,
    spacecraftPosition: [0, 8, 48],
    spacecraftVelocity: [0, 0, 0],
    spacecraftOrientation: { pitch: 0, yaw: 0, roll: 0 },
    flightMode: 'cockpit',
    landingState: 'none',
    takeoffState: 'airborne',
    gearDeployed: false,
    landingAssistance: false,
    headingAssistance: false,
    approachAssistance: false,
    flightTutorialStep: 0,
    isTutorialVisible: !storage.getItem('lucid_tutorial_completed_v1'),
    isIntroOpen: getSafeStorage().getItem('lucid_intro_seen_v1') !== 'true',
    setIntroOpen: (open: boolean) => {
      if (!open) {
        getSafeStorage().setItem('lucid_intro_seen_v1', 'true');
      }
      set({ isIntroOpen: open });
    },
    flightSensitivity: (getSafeStorage().getItem('lucid_flight_sensitivity') || 'default') as
      | 'default'
      | 'smooth'
      | 'agile',
    setFlightSensitivity: (preset: 'default' | 'smooth' | 'agile') => {
      getSafeStorage().setItem('lucid_flight_sensitivity', preset);
      set({ flightSensitivity: preset });
    },
    restartTutorial: () => {
      set({ flightTutorialStep: 0, isTutorialVisible: true });
    },
    isScanning: false,
    discoveredPlanets: { origin: true },
    throttle: 0.35,
    radarAltitude: 999,
    landingFeedback: null,

    setSpacecraftPhysics: (pos, vel, orientation) => {
      set({
        spacecraftPosition: pos,
        spacecraftVelocity: vel,
        spacecraftOrientation: orientation,
      });
    },

    setThrottle: (throttle) => set({ throttle }),
    setRadarAltitude: (radarAltitude) => set({ radarAltitude }),

    toggleGear: () => {
      const next = !get().gearDeployed;
      soundEngine.playGearToggle(next);
      set({ gearDeployed: next });
      return next;
    },

    setGearDeployed: (gearDeployed) => {
      soundEngine.playGearToggle(gearDeployed);
      set({ gearDeployed });
    },

    toggleLandingAssistance: () => {
      const next = !get().landingAssistance;
      if (next) soundEngine.playTargetLocked();
      else soundEngine.playUIBeep('low');
      set({ landingAssistance: next });
      return next;
    },

    toggleHeadingAssistance: () => {
      const next = !get().headingAssistance;
      if (next) soundEngine.playTargetLocked();
      else soundEngine.playUIBeep('low');
      set({ headingAssistance: next });
      return next;
    },

    toggleApproachAssistance: () => {
      const next = !get().approachAssistance;
      if (next) soundEngine.playTargetLocked();
      else soundEngine.playUIBeep('low');
      set({ approachAssistance: next });
      return next;
    },

    // Autopilot & Assistance Level Implementations
    autopilot: false,
    autopilotPhase: 'idle',
    flightAssistanceLevel: 'manual',

    setAutopilot: (active: boolean) => {
      if (active) {
        get().engageAutopilot();
      } else {
        get().disengageAutopilot();
      }
    },

    toggleAutopilot: () => {
      const active = !get().autopilot;
      if (active) {
        return get().engageAutopilot();
      } else {
        get().disengageAutopilot();
        return false;
      }
    },

    setAutopilotPhase: (phase) => set({ autopilotPhase: phase }),

    setFlightAssistanceLevel: (level) => {
      if (level === 'manual') {
        get().disengageAutopilot();
        set({
          flightAssistanceLevel: 'manual',
          headingAssistance: false,
          approachAssistance: false,
        });
        get().showNavigationToast('Flight mode: Manual Flight');
      } else if (level === 'assisted') {
        get().disengageAutopilot();
        set({
          flightAssistanceLevel: 'assisted',
          headingAssistance: true,
          approachAssistance: true,
        });
        get().showNavigationToast('Flight mode: Assisted Navigation (Route & drift assist active)');
      } else if (level === 'autopilot') {
        const success = get().engageAutopilot();
        if (success) {
          set({ flightAssistanceLevel: 'autopilot' });
        }
      }
    },

    engageAutopilot: (targetPlanetId) => {
      const target = targetPlanetId || get().selectedTargetId;
      if (!target || !PLANET_CATALOG[target]) {
        get().showNavigationToast('No destination selected. Choose a planet to begin your journey.', {
          type: 'warning',
          actionLabel: 'Choose Planet',
          onAction: () => get().setMapOpen(true),
        });
        return false;
      }
      if (targetPlanetId) {
        get().setTargetPlanet(targetPlanetId);
      }
      soundEngine.playTargetLocked();
      set({
        autopilot: true,
        autopilotPhase: 'aligning',
        flightAssistanceLevel: 'autopilot',
        headingAssistance: true,
        approachAssistance: true,
      });
      get().showNavigationToast(
        `Autopilot engaged. Heading toward ${PLANET_CATALOG[target].name}.`,
        {
          type: 'info',
          actionLabel: 'Take Manual Control',
          onAction: () => get().disengageAutopilot('Manual control restored.'),
        }
      );
      return true;
    },

    disengageAutopilot: (reason) => {
      if (get().autopilot) {
        soundEngine.playUIBeep('low');
      }
      set({
        autopilot: false,
        autopilotPhase: 'idle',
        flightAssistanceLevel: 'manual',
      });
      if (
        get().guidedExplorationState === 'navigating' ||
        get().guidedExplorationState === 'approaching'
      ) {
        set({ guidedExplorationState: 'manual-override' });
      }
      if (reason) {
        get().showNavigationToast(reason, { type: 'info' });
      }
    },

    // Guided Exploration Tour State & Actions
    guidedExplorationState: 'idle',
    guidedExplorationDestination: null,
    guidedExplorationAutoSuggest: true,
    guidedExplorationStopForExploration: true,
    setGuidedExplorationState: (state) => set({ guidedExplorationState: state }),

    startGuidedExploration: (startingPlanetId) => {
      const target =
        startingPlanetId ||
        get().selectedTargetId ||
        get().suggestNextGuidedPlanet() ||
        'origin';
      get().setTargetPlanet(target);
      const success = get().engageAutopilot(target);
      if (success) {
        set({
          guidedExplorationState: 'navigating',
          guidedExplorationDestination: target,
        });
        get().showNavigationToast(
          `Guided Exploration active: Heading toward ${PLANET_CATALOG[target].name}.`,
          { type: 'success' }
        );
      }
    },

    stopGuidedExploration: () => {
      get().disengageAutopilot();
      set({
        guidedExplorationState: 'idle',
        guidedExplorationDestination: null,
      });
      get().showNavigationToast('Guided Exploration stopped. You have manual control.');
    },

    pauseGuidedExploration: () => {
      get().disengageAutopilot();
      set({ guidedExplorationState: 'paused' });
      get().showNavigationToast('Guided Exploration paused. Take your time exploring.');
    },

    resumeGuidedExploration: () => {
      const target = get().guidedExplorationDestination || get().suggestNextGuidedPlanet();
      if (target) {
        get().startGuidedExploration(target);
      }
    },

    suggestNextGuidedPlanet: () => {
      const pos = get().spacecraftPosition;
      const visited = get().visitedPlanets;
      const active = get().activePlanet;
      const planetIds = Object.keys(PLANET_CATALOG) as PlanetId[];

      // Filter unvisited first
      const unvisited = planetIds.filter((pid) => !visited[pid] && pid !== active);
      const pool = unvisited.length > 0 ? unvisited : planetIds.filter((pid) => pid !== active);

      if (pool.length === 0) return null;

      pool.sort((a, b) => {
        const posA = getPlanetUniversePosition(a);
        const posB = getPlanetUniversePosition(b);
        const distA = Math.hypot(posA[0] - pos[0], posA[1] - pos[1], posA[2] - pos[2]);
        const distB = Math.hypot(posB[0] - pos[0], posB[1] - pos[1], posB[2] - pos[2]);
        return distA - distB;
      });

      return pool[0];
    },

    // Navigation Feedback & Recovery Implementations
    navigationToast: null,
    showNavigationToast: (message, opts) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      set({
        navigationToast: {
          id,
          message,
          type: opts?.type || 'info',
          actionLabel: opts?.actionLabel,
          onAction: opts?.onAction,
        },
      });
      setTimeout(() => {
        const cur = get().navigationToast;
        if (cur?.id === id) {
          set({ navigationToast: null });
        }
      }, 4500);
    },
    clearNavigationToast: () => set({ navigationToast: null }),

    isRecoveryModalOpen: false,
    setRecoveryModalOpen: (open) => set({ isRecoveryModalOpen: open }),

    findNearestPlanet: () => {
      const pos = get().spacecraftPosition;
      const planetIds = Object.keys(PLANET_CATALOG) as PlanetId[];
      let nearestId: PlanetId = 'origin';
      let minDist = Infinity;
      planetIds.forEach((pid) => {
        const pPos = getPlanetUniversePosition(pid);
        const d = Math.hypot(pPos[0] - pos[0], pPos[1] - pos[1], pPos[2] - pos[2]);
        if (d < minDist) {
          minDist = d;
          nearestId = pid;
        }
      });
      return nearestId;
    },

    isAutopilotHintDismissed:
      getSafeStorage().getItem('lucid_autopilot_hint_dismissed_v1') === 'true',
    dismissAutopilotHint: () => {
      getSafeStorage().setItem('lucid_autopilot_hint_dismissed_v1', 'true');
      set({ isAutopilotHintDismissed: true });
    },

    setFlightTutorialStep: (step) => set({ flightTutorialStep: step }),
    setIsTutorialVisible: (visible) => set({ isTutorialVisible: visible }),

    setFlightMode: (flightMode) => set({ flightMode }),
    setLandingState: (landingState, landingFeedback = null) =>
      set({ landingState, landingFeedback }),
    setTakeoffState: (takeoffState) => set({ takeoffState }),

    setTargetPlanet: (planetId) => {
      if (planetId) {
        soundEngine.playTargetLocked();
      }
      set({
        selectedTargetId: planetId,
        selectedDestination: planetId,
      });
    },

    selectDestination: (planetId) => {
      // Sets navigation target reference without teleporting
      get().setTargetPlanet(planetId);
    },

    clearDestination: () => {
      set({
        selectedTargetId: null,
        selectedDestination: null,
      });
    },

    enterUniverseView: () => {
      set({
        viewMode: 'universe',
        travelState: 'universe',
        selectedDestination: null,
      });
      soundEngine.playPlanetChord(['C3', 'G3', 'C4', 'E4', 'B4']);
    },

    cycleTargetPlanet: (direction = 1) => {
      const discovered = get().discoveredPlanets;
      const discoveredKeys = (Object.keys(PLANET_CATALOG) as PlanetId[]).filter(
        (id) => discovered[id]
      );
      if (discoveredKeys.length === 0) return 'origin';
      const current = get().selectedTargetId;
      const currentIndex = current ? discoveredKeys.indexOf(current) : -1;
      const nextIndex = (currentIndex + direction + discoveredKeys.length) % discoveredKeys.length;
      const nextPlanet = discoveredKeys[nextIndex];
      soundEngine.playTargetLocked();
      set({
        selectedTargetId: nextPlanet,
        selectedDestination: nextPlanet,
      });
      return nextPlanet;
    },

    pulseScanner: () => {
      soundEngine.playScannerPulse();
      set({ isScanning: true });
      setTimeout(() => set({ isScanning: false }), 2200);

      const craftPos = get().spacecraftPosition;
      const currentDiscovered = { ...get().discoveredPlanets };
      let newlyDiscoveredCount = 0;
      let latestDiscoveredName = '';

      const SCAN_RADIUS = 1800; // Scan range in universe units
      (Object.keys(PLANET_CATALOG) as PlanetId[]).forEach((pid) => {
        const planetPos = getPlanetUniversePosition(pid);
        const dist = Math.hypot(
          planetPos[0] - craftPos[0],
          planetPos[1] - craftPos[1],
          planetPos[2] - craftPos[2]
        );
        if (dist <= SCAN_RADIUS && !currentDiscovered[pid]) {
          currentDiscovered[pid] = true;
          newlyDiscoveredCount++;
          latestDiscoveredName = PLANET_CATALOG[pid]?.name || pid;
        }
      });

      if (newlyDiscoveredCount > 0) {
        set({ discoveredPlanets: currentDiscovered });
        get().addDiscovery(
          `Scanner Contact: ${latestDiscoveredName}`,
          'landmark',
          `Sensors identified ${newlyDiscoveredCount} planetary beacon(s) in sector.`
        );
      }
    },

    attemptLanding: (planetId, verticalSpeed, horizontalSpeed) => {
      const isGearDown = get().gearDeployed;
      const isVerticalSafe = Math.abs(verticalSpeed) <= 14.5;
      const isHorizontalSafe = horizontalSpeed <= 12.5;

      if (isGearDown && isVerticalSafe && isHorizontalSafe) {
        soundEngine.playTouchdown();
        soundEngine.stopEngine();
        const visited = { ...get().visitedPlanets, [planetId]: true };
        const discovered = { ...get().discoveredPlanets, [planetId]: true };
        storage.setItem('lucid_visited_planets', JSON.stringify(visited));

        const isGuided =
          get().guidedExplorationState === 'navigating' ||
          get().guidedExplorationState === 'approaching';

        // Disengage autopilot on touchdown
        get().disengageAutopilot();

        set({
          landingState: 'touchdown',
          flightMode: 'landed',
          activePlanet: planetId,
          visitedPlanets: visited,
          discoveredPlanets: discovered,
          landingFeedback: `TOUCHDOWN CONFIRMED // Landed on ${PLANET_CATALOG[planetId]?.name}. Press [E] to disembark.`,
          travelState: 'on_planet',
          isTransitioning: false,
          guidedExplorationState: isGuided ? 'awaiting-exploration' : get().guidedExplorationState,
        });

        if (isGuided) {
          get().showNavigationToast(
            `Destination reached: ${PLANET_CATALOG[planetId]?.name}. Choose whether to explore or continue.`,
            {
              type: 'success',
              actionLabel: 'Next Destination',
              onAction: () => {
                const next = get().suggestNextGuidedPlanet();
                if (next) get().startGuidedExploration(next);
              },
            }
          );
        }

        return true;
      } else {
        soundEngine.playShieldImpact();
        soundEngine.playProximityWarning();
        let reason = 'UNSAFE APPROACH';
        if (!isGearDown) {
          reason = 'LANDING GEAR RETRACTED! Press [G] to deploy.';
        } else if (!isVerticalSafe) {
          reason = `DESCENT SPEED TOO HIGH (${Math.round(Math.abs(verticalSpeed))} m/s > 14 m/s)! Throttle up to brake.`;
        } else if (!isHorizontalSafe) {
          reason = `HORIZONTAL DRIFT TOO HIGH (${Math.round(horizontalSpeed)} m/s > 12 m/s)! Stabilize heading.`;
        }

        set({
          landingState: 'failed',
          landingFeedback: `⚠ TOUCHDOWN ABORTED: ${reason}`,
        });

        setTimeout(() => {
          if (get().landingState === 'failed') {
            set({ landingState: 'none', landingFeedback: null });
          }
        }, 4000);

        return false;
      }
    },

    disembarkCraft: async () => {
      const currentPlanet = get().activePlanet;
      const isConnected = get().connectionMode === 'connected';
      const loadedObjects = await persistence.loadObjects(currentPlanet, isConnected);

      if (get().guidedExplorationState === 'awaiting-exploration') {
        set({ guidedExplorationState: 'paused' });
        get().showNavigationToast(
          'Guided Exploration paused. Take your time exploring on foot.',
          { type: 'info' }
        );
      }

      soundEngine.playChime('interact');
      set({
        viewMode: 'world',
        flightMode: 'on_foot',
        travelState: 'on_planet',
        objects: loadedObjects,
        contextPrompt: null,
        landingFeedback: null,
      });
    },

    boardCraft: () => {
      soundEngine.playChime('interact');
      set({
        viewMode: 'cockpit',
        flightMode: 'landed',
        takeoffState: 'grounded',
        contextPrompt: null,
        landingFeedback: `SEATED IN COCKPIT // Hold [W] or [Space] to fire vertical thrusters and take off.`,
      });
    },

    initiateTakeoff: () => {
      soundEngine.playTakeoffLiftoff();

      if (get().guidedExplorationState === 'paused') {
        const next = get().suggestNextGuidedPlanet();
        set({ guidedExplorationState: 'suggesting-next-destination' });
        get().showNavigationToast(
          next
            ? `Ready for next world? Suggested: ${PLANET_CATALOG[next]?.name}.`
            : 'All worlds explored! Open Starmap [M] for free exploration.',
          {
            type: 'info',
            actionLabel: next ? `Fly to ${PLANET_CATALOG[next]?.name}` : 'Open Starmap',
            onAction: () => {
              if (next) get().startGuidedExploration(next);
              else get().setMapOpen(true);
            },
          }
        );
      }

      set({
        takeoffState: 'liftoff',
        landingState: 'none',
        landingFeedback: 'LIFTOFF // Vertical thrusters firing! Retract gear [G] and pitch up for orbit.',
      });
      setTimeout(() => {
        set({
          takeoffState: 'airborne',
          flightMode: 'spaceflight',
          gearDeployed: false,
          landingFeedback: null,
        });
      }, 2500);
    },

    initiateTravel: async (targetPlanet) => {
      const destination = targetPlanet || get().selectedTargetId || 'origin';
      if (get().viewMode === 'cockpit') {
        get().setTargetPlanet(destination);
        return;
      }
      const isConnected = get().connectionMode === 'connected';
      const loadedObjects = await persistence.loadObjects(destination, isConnected);
      const visited = { ...get().visitedPlanets, [destination]: true };
      const discovered = { ...get().discoveredPlanets, [destination]: true };
      storage.setItem('lucid_visited_planets', JSON.stringify(visited));
      set({
        activePlanet: destination,
        objects: loadedObjects,
        visitedPlanets: visited,
        discoveredPlanets: discovered,
        selectedDestination: destination,
        selectedTargetId: destination,
      });
    },

    travelToPlanet: async (planetId) => {
      return get().initiateTravel(planetId);
    },

    completeLanding: () => {
      set({
        travelState: 'on_planet',
        isTransitioning: false,
      });
    },

    boardRocket: () => {
      soundEngine.playChime('interact');
      set({
        travelState: 'boarding',
        contextPrompt: null,
      });

      // Taking off sequence
      setTimeout(() => {
        set({
          travelState: 'taking_off',
          isTransitioning: true,
          transitionMessage: 'Firing Vertical Thrusters: Ascending to Space...',
        });
      }, 800);

      // Break atmosphere back into Universe View
      setTimeout(() => {
        get().completeTakeoff();
      }, 2600);
    },

    completeTakeoff: () => {
      set({
        viewMode: 'cockpit',
        travelState: 'universe',
        selectedDestination: null,
        isTransitioning: false,
        transitionMessage: '',
      });
      soundEngine.playTargetLocked();
    },

    exitToLanding: () => {
      set({
        viewMode: 'landing',
        travelState: 'universe',
        selectedDestination: null,
        contextPrompt: null,
        isBuildMode: false,
        selectedObject: null,
      });
    },

    setConnectionMode: (mode) => set({ connectionMode: mode }),

    setUserName: (name) => {
      getSafeStorage().setItem('lucid_user_name', name);
      set({ userName: name });
    },

    setAvatarConfig: (config) =>
      set((state) => ({ avatarConfig: { ...state.avatarConfig, ...config } })),

    setSoundEnabled: (enabled) => {
      soundEngine.setMuted(!enabled);
      set({ soundEnabled: enabled });
      if (enabled) {
        soundEngine.playPlanetChord(
          PLANET_CATALOG[get().activePlanet]?.rules.ambientSoundChord || ['C4', 'E4', 'G4']
        );
      }
    },

    setContextPrompt: (prompt, portalTarget = null) => {
      set({ contextPrompt: prompt, nearbyPortal: portalTarget });
    },

    setIsNearRocket: (near) => set({ isNearRocket: near }),

    triggerLandmarkInteraction: () => {
      const planet = PLANET_CATALOG[get().activePlanet];
      if (planet) {
        soundEngine.playChime('interact');
        set({ activeLandmark: planet.landmark });
      }
    },

    closeLandmarkModal: () => set({ activeLandmark: null }),

    toggleBuildMode: () => {
      set((state) => ({
        isBuildMode: !state.isBuildMode,
        selectedObject: null,
      }));
    },

    setSelectedTool: (tool) => set({ selectedTool: tool }),
    setPaletteColor: (color) => set({ paletteColor: color }),
    setSelectedObject: (obj) => set({ selectedObject: obj }),

    placeObjectAt: (position, rotation = [0, 0, 0]) => {
      const {
        activePlanet,
        selectedTool,
        paletteColor,
        userId,
        userName,
        connectionMode,
      } = get();

      soundEngine.playChime('place');

      const isConnected = connectionMode === 'connected';

      if (isConnected) {
        const newObj: WorldObject = {
          objectId: `temp-${Date.now()}`,
          locationId: activePlanet,
          creatorId: userId,
          creatorName: userName,
          type: selectedTool,
          transform: {
            position,
            rotation,
            scale: [1, 1, 1],
          },
          appearance: {
            color: paletteColor,
            emissive: paletteColor,
            emissiveIntensity: 1.2,
          },
          permissions: 'public',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ objects: [...state.objects, newObj] }));
        return newObj;
      } else {
        const created = persistence.addLocalObject(activePlanet, {
          locationId: activePlanet,
          creatorId: userId,
          creatorName: `${userName} (Local)`,
          type: selectedTool,
          transform: {
            position,
            rotation,
            scale: [1, 1, 1],
          },
          appearance: {
            color: paletteColor,
            emissive: paletteColor,
            emissiveIntensity: 1.2,
          },
          permissions: 'public',
        });

        set((state) => ({ objects: [...state.objects, created] }));
        return created;
      }
    },

    removeSelectedObject: () => {
      const { selectedObject, activePlanet, connectionMode, objects } = get();
      if (!selectedObject) return;

      const isConnected = connectionMode === 'connected';
      if (!isConnected) {
        persistence.removeLocalObject(activePlanet, selectedObject.objectId);
      }

      set({
        objects: objects.filter((o) => o.objectId !== selectedObject.objectId),
        selectedObject: null,
      });
    },

    resetCurrentPlanet: () => {
      const { activePlanet } = get();
      const fresh = persistence.resetLocalPlanet(activePlanet);
      set({ objects: fresh, selectedObject: null });
    },

    setSnapshot: (objects, presences, environment) => {
      set({ objects, presences, environment });
    },

    addRemoteObject: (object) => {
      set((state) => {
        const filtered = state.objects.filter(
          (o) => o.objectId !== object.objectId && !o.objectId.startsWith('temp-')
        );
        return { objects: [...filtered, object] };
      });
    },

    updateRemoteObject: (object) => {
      set((state) => ({
        objects: state.objects.map((o) =>
          o.objectId === object.objectId ? object : o
        ),
      }));
    },

    removeRemoteObject: (objectId) => {
      set((state) => ({
        objects: state.objects.filter((o) => o.objectId !== objectId),
        selectedObject:
          state.selectedObject?.objectId === objectId
            ? null
            : state.selectedObject,
      }));
    },

    addOrUpdatePresence: (presence) => {
      set((state) => {
        const others = state.presences.filter(
          (p) => p.sessionId !== presence.sessionId
        );
        return { presences: [...others, presence] };
      });
    },

    removePresence: (sessionId) => {
      set((state) => ({
        presences: state.presences.filter((p) => p.sessionId !== sessionId),
      }));
    },

    updatePresenceTransform: (sessionId, position, rotation, emote) => {
      set((state) => ({
        presences: state.presences.map((p) =>
          p.sessionId === sessionId
            ? { ...p, position, rotation, emote, lastSeenAt: Date.now() }
            : p
        ),
      }));
    },

    setEnvironmentState: (environment) => set({ environment }),

    addChatMessage: (msg) => {
      set((state) => ({
        chatMessages: [...state.chatMessages.slice(-40), msg],
      }));
    },

    setFeedbackOpen: (open) => set({ isFeedbackOpen: open }),
    openFinishExploration: () => set({ isFinishExplorationOpen: true }),
    closeFinishExploration: () => set({ isFinishExplorationOpen: false }),
    setHelpOpen: (open) => set({ isHelpOpen: open }),
    setMapOpen: (open) => set({ isMapOpen: open }),
    toggleMap: () => set((s) => ({ isMapOpen: !s.isMapOpen })),
    setChatOpen: (open) => set({ isChatOpen: open }),
    setProfileOpen: (open) => set({ isProfileOpen: open }),
  };
});

if (typeof window !== 'undefined') {
  (window as any).__LUCID_STORE__ = useUniverseStore;
}
