import { chromium, devices } from "playwright"
import startHttpServer from "./startHttpServer"

async function openAndScreenshotAStory() {

    const webServer = await startHttpServer()

    console.log('Web server started')

    // Setup
    const browser = await chromium.launch()
    const context = await browser.newContext(devices['Desktop Chrome'])
    const page = await context.newPage()

    await page.waitForTimeout(3000)
    
    // The actual interesting bit
    await page.goto('http://localhost:6006/iframe.html?viewMode=story&id=components-button--basic');
    await page.waitForSelector('#storybook-root')


    await page.screenshot({ path: '.reviz/the-screenshot.png', fullPage: true, scale: 'css' })

    // Teardown
    await context.close()
    await browser.close()

    webServer.kill()
}

export default openAndScreenshotAStory