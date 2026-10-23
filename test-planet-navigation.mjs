import puppeteer from 'puppeteer-core';

async function testNavigation() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--window-size=1440,900', '--enable-webgl', '--use-gl=angle', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  console.log('1. Awakening Cockpit...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Skip') || b.textContent?.includes('WAKE UP')
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  console.log('2. Opening Starmap Atlas in Cockpit View...');
  await page.keyboard.press('KeyM');
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/10_starmap_atlas_modal.png' });

  console.log('3. Selecting Pixel Realm in Starmap Atlas...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__;
    if (store) {
      store.getState().selectDestination('pixel');
      store.getState().setMapOpen(false);
    }
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/11_cockpit_targeting_pixel_realm.png' });

  console.log('4. Touching down on Pixel Realm...');
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__;
    if (store) {
      store.setState({
        viewMode: 'world',
        activePlanet: 'pixel',
        travelState: 'on_planet',
        isTransitioning: false,
      });
    }
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/12_pixel_realm_surface.png' });

  console.log('5. Opening Starmap while on foot and warping to Nature Prime...');
  await page.keyboard.press('KeyM');
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(() => {
    const store = window.__LUCID_STORE__;
    if (store) {
      store.setState({
        viewMode: 'world',
        activePlanet: 'nature',
        travelState: 'on_planet',
        isTransitioning: false,
      });
      store.getState().setMapOpen(false);
    }
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/13_nature_prime_surface.png' });

  console.log('🎉 Planet navigation test completed successfully!');
  await browser.close();
}

testNavigation().catch((e) => {
  console.error(e);
  process.exit(1);
});