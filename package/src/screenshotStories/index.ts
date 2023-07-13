import { BrowserContext, chromium, devices } from "playwright"
import startHttpServer from "./startHttpServer"
import path from 'path'
import fs from 'fs'
import collectStorybookSummary from "./collectStories"
import createPathIfNeeded from "../utils/createPathIfNeeded"

const createDefaultUrl = (storyId: string) => `http://localhost:6006/iframe.html?viewMode=story&id=${storyId}`

async function openAndScreenshotStory(
    context: BrowserContext, 
    storyId: string,
    storyPath: string,
    outputDirectory: string,
    url: (storyId: string) => string = createDefaultUrl
) {

    const storyUrl = url(storyId)
    const outputPath = path.join(outputDirectory, `${storyPath}.png`)

    const page = await context.newPage()

    // The actual interesting bit
    await page.goto(storyUrl);
    await page.waitForSelector('#storybook-root')

    createPathIfNeeded(outputPath)
    await page.screenshot({ path: outputPath, fullPage: true, scale: 'css' })
}

async function screenshotStories(outputDirectory: 'main' | 'current') {
    const storybookStaticPath = path.resolve('./storybook-static')

    if (!fs.existsSync(storybookStaticPath)) {
        throw new Error('Storybook build path does not exist')
    }

    const storybook = collectStorybookSummary(storybookStaticPath)

    const webServer = await startHttpServer(storybookStaticPath)

    console.log('Web server started')

    // Setup
    const browser = await chromium.launch()
    const context = await browser.newContext(devices['Desktop Chrome'])
    
    for (var story of storybook.storyIds) {
        await openAndScreenshotStory(
            context,
            story,
            `${storybook[story].title}/${storybook[story].name}`,
            path.resolve('.reviz', outputDirectory)
        )
    }

    // Teardown
    await context.close()
    await browser.close()

    webServer.kill()
}

export default screenshotStories