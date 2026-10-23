import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.resolve('screenshots');

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=metal'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });

  // Wait 3 seconds for 3D Three.js WebGL scene and cockpit interior to initialize
  await new Promise((r) => setTimeout(r, 3500));

  // 1. Initial Cockpit with Compass, Attitude Ball, Tutorial & Assistance Panel
  console.log('Capturing 14_guidance_hud_overview.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_guidance_hud_overview.png') });

  // 2. Select target (press Tab / 2 to select Candyverse) and press R to align nose directly
  console.log('Selecting target and aligning...');
  await page.keyboard.press('Digit2'); // Select candyverse
  await new Promise((r) => setTimeout(r, 600));
  await page.keyboard.press('KeyR'); // Align directly to target
  await new Promise((r) => setTimeout(r, 1200));

  console.log('Capturing 15_target_vector_aligned.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_target_vector_aligned.png') });

  // 3. Accelerate forward to show Velocity Vector (prograde marker) and Closing Speed
  console.log('Applying forward thrust...');
  await page.keyboard.down('KeyW');
  await new Promise((r) => setTimeout(r, 2000));
  await page.keyboard.up('KeyW');
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Capturing 16_velocity_vector_and_drift.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_velocity_vector_and_drift.png') });

  // 4. Steer away (hold A / ArrowLeft) so target moves off-screen behind/beside craft
  console.log('Steering away from target to show off-screen guidance badge...');
  await page.keyboard.down('KeyA');
  await new Promise((r) => setTimeout(r, 2500));
  await page.keyboard.up('KeyA');
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Capturing 17_offscreen_guidance_correction.png...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_offscreen_guidance_correction.png') });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error running capture script:', err);
  process.exit(1);
});
