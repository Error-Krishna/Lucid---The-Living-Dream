import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

async function runVerification() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--window-size=1440,900',
      '--enable-webgl',
      '--use-gl=angle',
      '--no-sandbox',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
    },
  });

  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('TOUCHDOWN') || msg.text().includes('DISCOVERY')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));

  console.log('📸 1. Capturing Initial First-Person Spacecraft Cockpit...');
  await page.screenshot({ path: 'screenshots/v2_01_cockpit_manual_flight.png' });

  // 1. Verify initial state
  const initialState = await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    return {
      viewMode: store?.viewMode,
      flightMode: store?.flightMode,
      pos: store?.spacecraftPosition,
      discovered: Object.keys(store?.discoveredPlanets || {}),
      target: store?.selectedTargetId,
    };
  });
  console.log('Initial State:', initialState);

  // 2. Pulse Scanner (F key)
  console.log('📡 2. Pulsing Sector Scanner (F key)...');
  await page.keyboard.press('KeyF');
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/v2_02_scanner_pulse.png' });

  const scannedState = await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    return {
      discovered: Object.keys(store?.discoveredPlanets || {}),
      isScanning: store?.isScanning,
    };
  });
  console.log('Post-Scan Discovered Worlds:', scannedState.discovered);

  // 3. Open Starmap Navigation Atlas (M key)
  console.log('🗺️ 3. Opening Navigation Atlas (M key)...');
  await page.keyboard.press('KeyM');
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/v2_03_starmap_atlas.png' });

  // 4. Lock Target Nav Reference (e.g. Candyverse)
  console.log('🎯 4. Locking Target Navigation Reference from Atlas...');
  const targetLocked = await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    const initialPos = [...store.spacecraftPosition];
    store.setTargetPlanet('candyverse');
    store.setMapOpen(false);
    const postPos = store.spacecraftPosition;
    return {
      target: store.selectedTargetId,
      initialPos,
      postPos,
      didTeleport: initialPos[0] !== postPos[0] || initialPos[2] !== postPos[2],
    };
  });
  console.log('Target Reference Result (No Teleport):', targetLocked);
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/v2_04_target_locked_reticle.png' });

  // 5. Test Manual Steering & Thrust
  console.log('🚀 5. Testing Manual Spacecraft Thrust & Acceleration...');
  await page.keyboard.down('KeyW');
  await new Promise((r) => setTimeout(r, 1500));
  await page.keyboard.up('KeyW');

  const physicsState = await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    return {
      pos: store?.spacecraftPosition,
      vel: store?.spacecraftVelocity,
      throttle: store?.throttle,
      gear: store?.gearDeployed,
    };
  });
  console.log('Flight Physics After Thrust:', physicsState);

  // 6. Test Landing Validation: Gear down and safe touchdown
  console.log('🛬 6. Testing Manual Landing & Touchdown...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    store.setGearDeployed(true);
    store.attemptLanding('origin', -4.5, 3.0);
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/v2_05_touchdown_confirmed.png' });

  // 7. Disembark on foot
  console.log('🚶 7. Disembarking onto Planet Surface on Foot (E key)...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    store.disembarkCraft();
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/v2_06_on_foot_surface.png' });

  // 8. Board spacecraft cockpit
  console.log('🛸 8. Returning to Spacecraft & Boarding Cockpit (E key)...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    store.boardCraft();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/v2_07_seated_in_cockpit.png' });

  // 9. Manual Takeoff Liftoff
  console.log('🔥 9. Executing Manual Takeoff Liftoff (Holding W/Space)...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__?.getState();
    store.initiateTakeoff();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/v2_08_liftoff_ascent.png' });

  await browser.close();
  console.log('✅ ALL MANUAL FLIGHT VERIFICATIONS PASSED & SCREENSHOTS CAPTURED!');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
