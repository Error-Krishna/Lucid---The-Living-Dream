import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve('screenshots');

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Launching browser for Environment & Lighting Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=metal'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();

  // Listen to browser console messages to detect any errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 3500));

  // 1. Cockpit view landed on landing pad
  console.log('Capturing 18_cockpit_landed_atmosphere.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_cockpit_landed_atmosphere.png') });

  // 2. Press [E] to Disembark and explore Candyverse on foot!
  console.log('Disembarking craft to on-foot exploration on Candyverse...');
  await page.keyboard.press('KeyE');
  await new Promise((r) => setTimeout(r, 3000));

  console.log('Capturing 19_candyverse_sun_and_sky.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19_candyverse_sun_and_sky.png') });

  // 3. Look up / around on Candyverse to showcase the visible golden sun, corona halo, and Sugar Spire
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(720, 260); // Look up toward the sky and sun
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 1500));

  console.log('Capturing 20_candyverse_visible_sun_and_spire.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20_candyverse_visible_sun_and_spire.png') });

  // 4. Switch to Origin World via Starmap / store to verify Origin lighting & sun
  console.log('Switching to Origin World...');
  await page.evaluate(() => {
    // @ts-ignore
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM' }));
  });
  await new Promise((r) => setTimeout(r, 800));

  // Direct fast travel to Origin in world mode
  await page.evaluate(() => {
    // Access zustand store in window or trigger travel
    const state = JSON.parse(localStorage.getItem('lucid-universe-storage') || '{}');
  });

  // Press [M] again or close map, and travel via starmap modal buttons
  console.log('Closing map and traveling via store...');
  await page.evaluate(() => {
    // Simulate navigation to Origin
    const store = window.__LUCID_STORE__;
    if (store) {
      store.getState().travelToPlanet('origin');
    }
  });

  // Let's also use keyboard shortcut or click in Starmap modal if open
  const planetButtons = await page.$$('button');
  for (const btn of planetButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Origin')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 2500));

  console.log('Capturing 21_origin_sun_and_monolith.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21_origin_sun_and_monolith.png') });

  // 5. Open Starmap again and visit Nature Prime
  console.log('Visiting Nature Prime...');
  await page.keyboard.press('KeyM');
  await new Promise((r) => setTimeout(r, 800));
  const buttonsNature = await page.$$('button');
  for (const btn of buttonsNature) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Nature Prime')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 2500));

  console.log('Capturing 22_nature_prime_canopy_sun.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22_nature_prime_canopy_sun.png') });

  // 6. Open Feedback Modal to verify deployment feedback flow
  console.log('Opening Finish Exploration / Feedback modal...');
  const finishButtons = await page.$$('button');
  for (const btn of finishButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Finish Exploration')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));

  console.log('Capturing 23_production_feedback_modal.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23_production_feedback_modal.png') });

  await browser.close();
  console.log('All environment verifications captured successfully!');
  if (consoleErrors.length > 0) {
    console.log('Console Errors caught:', consoleErrors);
  } else {
    console.log('Zero console errors detected during runtime!');
  }
}

run().catch((err) => {
  console.error('Error in verify_environments:', err);
  process.exit(1);
});
