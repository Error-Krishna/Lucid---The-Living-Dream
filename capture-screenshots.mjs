import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

async function capture() {
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
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));

  console.log('📸 1. Cockpit Awakening...');
  await page.screenshot({ path: 'screenshots/01_cockpit_awakening.png' });

  console.log('📸 2. Awakening Flight Systems and Engaging Radar Target Lock...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('INITIALIZE') || b.textContent?.includes('WAKE UP')
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/02_cockpit_flight_radar.png' });

  console.log('📸 3. Atmospheric Entry Corridor...');
  await page.evaluate(() => {
    const progressSlider = document.querySelector('input[type="range"]');
    if (progressSlider) {
      progressSlider.value = '65';
      progressSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/03_atmospheric_entry.png' });

  console.log('📸 4. First-Person Landing & Disembarking onto Candyverse Surface...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__;
    if (store) {
      store.setState({
        viewMode: 'world',
        activePlanet: 'candyverse',
        travelState: 'on_planet',
        isTransitioning: false,
        transitionMessage: '',
      });
    }
  });
  await new Promise((r) => setTimeout(r, 2200));

  // Turn to look towards the parked spacecraft on the launch pad
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(1100, 450, { steps: 20 });
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshots/04_candyverse_parked_spacecraft.png' });

  console.log('📸 5. Encountering Living Fauna (Sugar Sporeling critter) & Discovery Toast...');
  // Turn back towards the fauna
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(340, 450, { steps: 20 });
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const store = window.__LUCID_STORE__;
    if (store) {
      store.getState().addDiscovery(
        'Sugar Sporeling (Fauna)',
        'fauna',
        'Whimsical confectionery critter that hops inquisitively across candy dunes.'
      );
    }
  });
  await page.screenshot({ path: 'screenshots/05_living_creature_discovery.png' });

  console.log('📸 6. Exploring The Great Sugar Spire...');
  await page.keyboard.down('KeyW');
  await new Promise((r) => setTimeout(r, 2200));
  await page.keyboard.up('KeyW');
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/06_sugar_spire_landmark.png' });

  console.log('📸 7. Opening First-Person World Builder Palette...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Build & Create')
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/07_world_builder.png' });

  console.log('📸 8. Opening 3-Question Evaluation Feedback Modal...');
  await page.evaluate(() => {
    const exitBuild = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Exit Build Mode')
    );
    exitBuild?.click();

    const store = window.__LUCID_STORE__;
    if (store) {
      store.getState().openFinishExploration();
    }
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/08_evaluation_feedback_survey.png' });

  console.log('📸 9. Closing Modal and Returning to Spacecraft / Launching to Space...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__;
    if (store) {
      store.getState().closeFinishExploration();
      store.getState().boardRocket();
    }
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/09_boarding_spacecraft_ascent.png' });

  console.log('🎉 All high-resolution screenshots captured successfully!');
  await browser.close();
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});