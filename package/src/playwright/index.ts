import { chromium, devices } from "playwright";

async function openAndScreenshotAStory() {
    // Setup
    const browser = await chromium.launch()
    const context = await browser.newContext(devices['Desktop Chrome'])
    const page = await context.newPage()

    // The actual interesting bit
    await context.route('**.jpg', route => route.abort());
    await page.goto('http://localhost:6006/iframe.html?viewMode=story&id=components-button--another-one');
    await page.waitForSelector('#storybook-root')

    await page.screenshot({ path: '.reviz/the-screenshot.png', fullPage: true, scale: 'css' })

    // Teardown
    await context.close()
    await browser.close()
}

export default openAndScreenshotAStory