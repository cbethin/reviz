import { chromium, devices } from "playwright"
import { spawn } from 'child_process'

async function openAndScreenshotAStory() {
    // Start storybook 
    let webServer = spawn('npx', 'http-server ./storybook-static -p 6006'.split(' '))

    webServer.on('message', data => console.log(data))

    webServer.on('error', data => console.error)
    
    // Setup
    const browser = await chromium.launch()
    const context = await browser.newContext(devices['Desktop Chrome'])
    const page = await context.newPage()

    await page.waitForTimeout(3000)
    
    // The actual interesting bit
    await page.goto('http://localhost:6006/iframe.html?viewMode=story&id=components-button--another-one');
    await page.waitForSelector('#storybook-root')


    await page.screenshot({ path: '.reviz/the-screenshot.png', fullPage: true, scale: 'css' })

    // Teardown
    await context.close()
    await browser.close()
}

export default openAndScreenshotAStory