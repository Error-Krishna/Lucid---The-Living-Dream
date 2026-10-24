# LUCID: THE LIVING DREAM
### Interactive MVP Prototype — First-Person Spaceflight, Living Dream Multiverse & Environment Lighting

> *“A universe shaped by the people who wander through it. Some worlds are discovered. Others are created.”*

---

## 1. What is LUCID?

**LUCID** is a persistent, multiplayer, dreamlike virtual multiverse. Instead of opening an ordinary website or static 3D demonstration, visitors awaken seated inside the cockpit of an exploration spacecraft. Looking out through the canopy windshield into deep space, players pilot their vessel, navigate by compass and artificial horizon instrumentation, detect celestial worlds with dynamic radar, pilot continuous atmospheric re-entries and manual landings, step out on foot in true first person, discover living alien creatures and reactive flora under visible celestial suns and atmospheric skies, build persistent structures, interact with fellow wanderers, and return to their spacecraft to explore the cosmos.

Each world in LUCID features a distinct aesthetic grammar, celestial orbit, custom procedural sky dome, visible sun with corona halo, surface gravity, acoustic drone chords, and interactive monuments.

---

## 2. Core Experience: The Continuous First-Person Journey

The prototype implements a continuous, uninterrupted exploration loop:

```
Spacecraft Cockpit Flight ──► Select Destination ──► Flight Guidance HUD
                                                          │
                                                          ▼
Touchdown on Landing Pad ◄── Atmospheric Descent ◄── Manual Orbital Flight
           │
           ▼
On-Foot Planetary Exploration ──► Living Fauna & Flora ──► World Building
           │
           ▼
Return to Spacecraft [E] ──► Manual Thruster Takeoff ──► Return to Space
```

1. **Phase A — Wake Up Inside the Spacecraft Cockpit**:
   - The application opens seated inside the vessel looking through the forward windshield.
   - Restrained cockpit interior with structural canopy arches, dual articulated flight sticks responding to steering inputs, and pilot suit forearms.
   - Progressive awakening sequence spooling life support, reactor glow, and cabin illumination.
2. **Phase B — Spacecraft Flight Guidance & Attitude Instruments**:
   - **Continuous 360° Compass Ribbon Tape**: Infinite-scrolling heading tape with degree readouts and cardinal directions (`000 N`, `045 NE`, `090 E`, `135 SE`, `180 S`, `225 SW`, `270 W`, `315 NW`) and dynamic target bearing diamond (`TRG`).
   - **Attitude Indicator / Artificial Horizon MFD**: 360° tilting horizon ball with pitch ladder lines ($-30^\circ$ to $+30^\circ$), roll banking rotation, and fixed aircraft reference symbol.
   - **Optical Nose Crosshair (`[ + ] NOSE`)**: Fixed forward boresight reticle on the canopy windshield.
   - **Dynamic Velocity Vector / Flight Path Marker (`-◯-`)**: Projects the true 3D physical movement vector onto the screen, visualizing lateral drift and vertical climb/sink relative to where the nose is pointed.
   - **Screen-Space Target Reticle**: Tracks the target planet across the windshield, confirming alignment with `● VECTOR ALIGNED` when within $\le 4^\circ$.
   - **Off-Screen & Behind Guidance Badge**: Explicit steering commands (`STEER LEFT/RIGHT X° [A/D]`, `PITCH UP/DOWN Y° [PULL/PUSH]`, and `Align Directly to Target [R]`).
   - **Tactical Flight Telemetry Dashboard**: Forward speed, lateral drift, vertical speed, throttle %, closing speed (`+X km/s (Closing)` vs opening), and estimated arrival time countdown (`~Xs`).
   - **Assistance Modes**:
     - Heading Assist `[Z]`: Softly coordinates pitch & yaw towards target vector without overriding manual inputs.
     - Approach Assist `[C]`: Dampens lateral drift relative to approach corridor and regulates safe arrival velocity.
     - Landing Level Assist `[X]`: Auto-levels pitch and roll during descent.
     - Landing Gear `[G]`: Toggles gear deployment with tactile indicators.
   - **Interactive 7-Step Pilot Tutorial**: Step-by-step in-cockpit guide covering throttle, steering, targeting, vector alignment, velocity drift, and landing.
3. **Phase C — Continuous Flight Stages & Atmospheric Re-entry**:
   - *Spaceflight*: 360° continuous yaw and pitch steering across deep space.
   - *Target Approach*: Visual scaling of the target celestial body beyond the canopy windshield.
   - *Atmospheric Entry*: Ionization heat shimmer, aerodynamic camera shake, and procedural atmospheric rumble.
   - *Descent & Touchdown*: Landing gear deployment, retro-thruster flare, ground proximity GPWS warnings, and tactile touchdown.
4. **Phase D — First-Person Planetary Exploration**:
   - True first-person perspective at natural eye-level (~1.68m).
   - Pointer-locked mouse look (`Click to look`, `ESC to release`) with clamped pitch to prevent disorienting flips.
   - Subtle vertical head bobbing and roll tilt while walking and sprinting.
   - Dynamic landing compression dip and smooth damping recovery upon jumping and touching down.
   - Ground height queries `getTerrainElevation(x, z)` across dunes and contoured calderas.
5. **Phase E — Visible Celestial Sun & Realistic Environmental Lighting**:
   - Every planet features a visible sun or celestial star in the sky dome with core disc, corona halo, and subtle solar rays.
   - The visible sun and directional lighting vector agree precisely, casting natural soft PCF contact shadows.
   - Hemisphere lighting delivers realistic sky bounce from above and warm ground bounce from below, ensuring shadows are never pitch-black voids.
   - Seamless extended horizon skirt stretching out to 190 units, accompanied by distant perimeter mountain and crater ridges that eliminate sudden platform edge cuts and establish 3 distinct visual depth levels (Foreground, Midground, Background).
6. **Phase F — Living Fauna, Reactive Flora & Field Journal**:
   - **Sugar Sporelings**: Autonomous bouncy sugar critters with hopping physics, curious chirping, player proximity investigation, and `[E]` observation interactions.
   - **Sugar Wisps**: Floating bioluminescent dream wisps with sinusoidal hovering, resonant rings, and attunement interactions.
   - **Reactive Flora**: Singing Sporecaps, Harmonic Blossoms, and Frosting Blooms that intensify glow and harmonize as the player approaches.
   - **Discovery Journal**: Discovering new species triggers real-time discovery toasts and logs records into the field journal.
7. **Phase G — Return to Spacecraft & Flight Loop**:
   - The exploration lander craft remains parked on the landing pad at `[-6.5, 4]`.
   - Approaching displays `Board Spacecraft Cockpit [E]`.
   - Pressing `E` boards the spacecraft, fires vertical ascent thrusters, and returns seamlessly to the first-person flight cockpit.
8. **Phase H — Central Procedural Audio Engine**:
   - Pure Web Audio synthesizer with zero external sound file dependencies:
   - Dynamic cockpit engine hum and ion boost acceleration.
   - Atmospheric re-entry wind rumble and turbulent pink-noise filtering.
   - Radar blip sweeps, target locking chime, landing gear hydraulics, and touchdown thud.
   - Ground footstep crunch synchronized to player movement cadence.
   - Natural jump impulse and landing impact.
   - Whimsical creature chirps and resonant harmonic plant chords.

---

## 3. Visual Tour & Verified Screenshots

All high-fidelity screenshots are captured directly from the running prototype in the [`screenshots/`](./screenshots/) directory:

### Flight Guidance HUD & Spacecraft Navigation
| Flight Guidance HUD Overview | Target Vector Aligned (`≤ 4°`) | Velocity Vector & Drift Telemetry |
| :---: | :---: | :---: |
| ![Flight Guidance HUD Overview](./screenshots/14_guidance_hud_overview.png) | ![Target Vector Aligned](./screenshots/15_target_vector_aligned.png) | ![Velocity Vector & Drift](./screenshots/16_velocity_vector_and_drift.png) |

| Off-Screen Guidance & Steering Corrections | Cockpit Landed Atmospheric Lighting | Cockpit Targeting Pixel Realm |
| :---: | :---: | :---: |
| ![Offscreen Guidance](./screenshots/17_offscreen_guidance_correction.png) | ![Cockpit Landed Atmosphere](./screenshots/18_cockpit_landed_atmosphere.png) | ![Targeting Pixel Realm](./screenshots/11_cockpit_targeting_pixel_realm.png) |

### Planetary Exploration, Visible Sun & Atmosphere
| Candyverse Visible Golden Sun & Sky Dome | Candyverse Spire & Horizon Skirt | Origin Visible Star & Monolith |
| :---: | :---: | :---: |
| ![Candyverse Sun and Sky](./screenshots/19_candyverse_sun_and_sky.png) | ![Candyverse Spire and Sun](./screenshots/20_candyverse_visible_sun_and_spire.png) | ![Origin Sun and Monolith](./screenshots/21_origin_sun_and_monolith.png) |

| Nature Prime Canopy Sun & Foliage | Production Feedback Evaluation Modal | Multiverse Starmap Atlas (`M`) |
| :---: | :---: | :---: |
| ![Nature Prime Canopy Sun](./screenshots/22_nature_prime_canopy_sun.png) | ![Production Feedback Modal](./screenshots/23_production_feedback_modal.png) | ![Starmap Atlas](./screenshots/10_starmap_atlas_modal.png) |

---

## 4. Planetary Multiverse Catalog

LUCID includes 10 charted planetary realms across diverse archetypes, each with dedicated `PlanetEnvironmentConfig`:

| Planet | Archetype | Sky & Atmospheric Lighting | Sun & Celestial Light | Landmark / Key Monument |
| :--- | :--- | :--- | :--- | :--- |
| **Origin** | Cosmic Nexus Hub | Deep indigo starlight sky, soft horizon haze | Indigo-white radiant star with corona | *The Monolith of Origin* |
| **Candyverse** | Confectionery Dream | Warm pastel pink/peach sky dome | Soft golden sun with warm corona | *The Great Sugar Spire* |
| **Pixel Realm** | Digital Voxel World | Cyber grid sky, teal digital haze | Emerald voxel star | *Bit-Monolith 01* |
| **Nature Prime** | Living Bio-Canopy | Lush green atmospheric canopy | Brilliant golden sun passing through canopy | *The Mother Spore Grove* |
| **Glassia** | Prismatic Shard World | Pale cyan/blue prismatic sky | High-intensity cyan-white prismatic sun | *The Prism Citadel* |
| **The Abyss** | Oceanic Ruin | Deep blue-green underwater atmosphere | Surface water caustics & god rays | *The Sunken Obelisk* |
| **Zephyr** | Gas Giant / Sky Citadels | Warm amber/orange twilight sky | Golden sunset star illuminating clouds | *The Stratos Spire* |
| **Ignis** | Volcanic Ember Realm | Molten crimson & obsidian sky dome | Incandescent red-orange core star | *The Obsidian Anvil* |
| **Astraea** | Crystalline Ice Shards | Polar cyan aurora sky | Pale arctic ice sun | *The Glacial Needle* |
| **Chronos** | Clockwork Astral Realm | Celestial amber/brass matrix sky | Golden astrolabe sun | *The Chronos Astrolabe* |

---

## 5. Persistent World Building

Visitors can permanently alter the reality of any planet using the **Dream Architect World Builder** (`B` key):
- **Dream Beacon**: Pulsing radiant guidance orb with animated corona.
- **Resonant Crystal**: Prismatic quartz emitting harmonic synth resonance.
- **Living Flora**: Bioluminescent dream mushrooms that glow in the dark.
- **Geometric Relic**: Nested kinetic wireframe structures.
- **Levitating Step**: Floating platform for custom parkour paths.
- **Star Monolith**: Ancient dark runic pillar.

**Honest Dual Persistence**:
- **Local Demo Mode**: Automatically active when backend is offline. World modifications are stored in browser `localStorage` and persist through tab closures and world hops.
- **Connected Multiplayer**: With the backend active, placed objects are validated, stored authoritatively, and instantly broadcast to all connected wanderers via Socket.IO.

---

## 6. Streamlined Product Evaluation & Feedback

To evaluate whether LUCID is worth developing into a full-scale commercial product, the application features an integrated **Finish Exploration** flow:
- Accessible at any time via the prominent **Finish Exploration** button in the HUD and on the landing pad.
- **Three Required Evaluative Questions**:
  1. *How was your experience?* (`Amazing`, `Good`, `Okay`, `Not for me`)
  2. *What interested you most?* (`Exploring the planets`, `The visuals and atmosphere`, `Moving around and interacting with the world`, `The idea of a shared, persistent universe`, `I did not find it interesting yet`)
  3. *Should I continue building LUCID into a full project?* (Two balanced, unbiased choices: **`YES — KEEP BUILDING`** vs **`NO — RETHINK THE IDEA`**)
- **One Optional Field**: *Any one thing you would improve?*
- The submit button remains disabled until all 3 required questions are answered.
- Submissions save to the API server when connected, with automatic local draft fallback and 1-click JSON export.

---

## 7. Technology Stack

- **Frontend**:
  - React 18 & TypeScript
  - Vite 5 (Bundler & Preview Server)
  - Three.js (`three` r169)
  - React Three Fiber (`@react-three/fiber` v8)
  - Drei (`@react-three/drei` v9)
  - Zustand 4 (Reactive universe state machine)
  - Tailwind CSS 3 (Styling & sci-fi telemetry glass panels)
  - Lucide React (Icons)
  - Custom Web Audio API Synthesizer (Chords & Chimes)
- **Backend**:
  - Node.js (v20+ / v24)
  - Express 4 (REST API)
  - Socket.IO 4 (Real-time gateway & planetary rooms)
  - TypeScript & TSX
- **Quality Assurance**:
  - Vitest (Unit & real-time multiplayer socket integration tests)
  - Headless Chrome (`puppeteer-core`) for screenshot verification

---

## 8. Complete Controls & Navigation Guide

### A. Spacecraft Cockpit Flight & Planet Targeting
| Key / Action | Function |
| :--- | :--- |
| **W / S** | Throttle propulsion up / down (0% to 100%) |
| **A / D / Mouse** | Full 360° Continuous Yaw Steering & Banking |
| **Q / E** | Manual Roll Trim |
| **R** | 180° Quick Turnaround / Align directly with selected target |
| **Z** | Toggle **Heading Assistance** (smooth orientation assist) |
| **C** | Toggle **Approach Assistance** (lateral drift damping & corridor speed control) |
| **X** | Toggle **Landing Level Assistance** (auto-levels pitch/roll in descent) |
| **G** | Toggle **Landing Gear** (Down / Up) |
| **Shift** (Hold) | Engage high-output Ion Drive Boost |
| **Space** | Toggle Autopilot Vector Stabilization (or liftoff if landed) |
| **Tab / T** | Cycle Target Navigation Reference (`Shift+Tab` for reverse) |
| **1 – 0** | Direct Target Select: `1`: Origin, `2`: Candyverse, `3`: Pixel Realm, etc. |
| **F** | Pulse Long-Range Holographic Scanner |
| **M** | Open 10-Planet Navigation Atlas |
| **H** | Toggle Flight Tutorial & On-screen Controls Pill |
| **U** | Switch to 3D Orbital Universe View |

### B. First-Person Ground Exploration
| Key / Action | Function |
| :--- | :--- |
| **W, A, S, D** / Arrows | Walk across dunes and planetary terrain |
| **Click Screen** | Engage Pointer Lock mouse look (`ESC` to release) |
| **Shift** (Hold) | Sprint with dynamic head bobbing |
| **Space** | Jump (scaled by planetary surface gravity) |
| **E** | Contextual interaction: Board Spacecraft, Observe Flora/Fauna, Commune with Landmarks |
| **B** | Toggle Dream Architect World Builder palette |
| **M** | Open Starmap Atlas for instant planetary fast travel or retargeting |
| **Mobile Touch** | Virtual joystick for movement + Jump & Action buttons |

---

## 9. How to Run Locally

### Quick Start
```bash
# 1. Install dependencies
pnpm install

# 2. Build shared contracts
pnpm --filter @lucid/shared build

# 3. Start development servers
pnpm dev
```

- **Frontend Client**: http://localhost:5173 (or http://localhost:5174)
- **Backend API Server**: http://localhost:4000
- **API Health Check**: http://localhost:4000/api/health

### Production Build & Preview
```bash
# Build all workspaces
pnpm build

# Start preview server
pnpm --filter lucid-web preview --port 5174
```

### Running Automated Checks
```bash
# Run unit & multiplayer tests
pnpm test

# Run TypeScript typechecks
pnpm typecheck
```

---

## 10. Deployment Readiness & Hosting Guide

The repository is configured for immediate deployment across popular platforms:

### A. Frontend Static Hosting (Vercel / Netlify / Cloudflare Pages)
- **Root Directory**: `./` (or `apps/web`)
- **Build Command**: `pnpm --filter "./packages/*" build && pnpm --filter lucid-web build`
- **Output Directory**: `apps/web/dist`
- **Configuration File**: [`vercel.json`](./vercel.json) is already pre-configured with SPA route rewrites.
- **Environment Variables**:
  - `VITE_API_URL`: (Optional) Base URL of deployed backend. If omitted, frontend runs in local demo mode with full browser storage.
  - `VITE_SOCKET_URL`: (Optional) WebSocket gateway URL.

### B. Full-Stack Hosting (Render / Railway / Docker)
- **Configuration File**: [`render.yaml`](./render.yaml) is pre-configured with two services:
  1. `lucid-web`: Static web app.
  2. `lucid-api`: Node.js web service running `node apps/api/dist/server.js`.
- **Environment Variables**:
  - `CLIENT_ORIGIN`: Set to frontend domain (e.g. `https://lucid.vercel.app` or `*`).
  - `PORT`: Set by hosting provider (defaults to 4000 or 10000).
  - `MONGODB_URI`: (Optional) Persistent MongoDB cluster connection string.

---

## 11. Repository Structure

```
LUCID/
├── .env.example                          # Documented environment variables
├── vercel.json                           # Vercel SPA deployment configuration
├── render.yaml                           # Full-stack Render deployment manifest
├── apps/
│   ├── api/                              # Backend Express & Socket.IO server
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── feedback/             # 3-question survey & export controllers
│   │   │   │   ├── multiplayer/          # Real-time room synchronization
│   │   │   │   └── world/                # World state & object persistence
│   │   │   ├── storage/worldStore.ts     # Authoritative storage layer
│   │   │   └── server.ts                 # Listener on port 4000
│   └── web/                              # Frontend React + Three.js client
│       ├── src/
│       │   ├── app/App.tsx               # Main view dispatcher & overlays
│       │   ├── features/
│       │   │   ├── cockpit/              # First-person cockpit, guidance HUD, telemetry
│       │   │   ├── controls/             # Grounded physics & cylinder obstacle collisions
│       │   │   ├── feedback/             # Evaluative 3-question survey modal
│       │   │   ├── landing/              # Hero view & cosmic gateway
│       │   │   ├── spacecraft/           # Procedural 3D rocket, landing pad, flight overlay
│       │   │   ├── universe/             # Dedicated 3D deep space exploration scene
│       │   │   ├── planets/              # 10 planetary surface environments & atmosphere system
│       │   │   │   ├── planetEnvironmentConfig.ts # Shared 10-planet lighting/sky configs
│       │   │   │   └── PlanetaryAtmosphereAndSun.tsx # Sky domes, visible suns, lighting
│       │   │   └── world-builder/        # Holographic placement & palette
│       │   └── stores/useUniverseStore.ts# TravelState machine & state store
├── packages/
│   └── shared/                           # Shared types, travel states, planet catalog
├── docs/                                 # Source of Truth PDF
├── screenshots/                          # Verified high-res screenshots (1-23)
└── scripts/                              # Puppeteer screenshot & verification automation
```

---

*LUCID: The Living Dream — MVP Prototype. All features verified with automated tests, production builds, and runtime browser automation.*
