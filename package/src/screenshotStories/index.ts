import { BrowserContext, chromium, devices } from "playwright"
import startHttpServer from "./startHttpServer"
import path from 'path'
import fs from 'fs'
import collectStorybookSummary from "./collectStories"
import createPathIfNeeded from "../utils/createPathIfNeeded"

const createDefaultUrl = (storyId: string) => `http://localhost:6006/iframe.html?viewMode=story&id=${storyId}`

/**
 * 
 * @param {@link BrowserContext} context Playwright context used to create new pages
 * @param {string} storyId ID of the story to be screenshotted
 * @param {string} storyPath path of the story to be screenshotted
 * @param {string} outputDirectory directory to place screenshots in
 * @param {(storyId: string) => string} url function to generate URLs from a given storyID. URL should point to the story's iframe
 */
async function openAndScreenshotStory(
    context: BrowserContext, 
    storyId: string,
    storyPath: string,
    outputDirectory: string,
    url: (storyId: string) => string = createDefaultUrl
) {

    console.log('Screenshotting:', storyId)
    const storyUrl = url(storyId)
    const outputPath = path.join(outputDirectory, `${storyPath}.png`)

    const page = await context.newPage()

    // The actual interesting bit
    await page.goto(storyUrl);
    await page.waitForSelector('#storybook-root')

    createPathIfNeeded(outputPath)
    await page.screenshot({ path: outputPath, fullPage: true, scale: 'css' })
}

/**
 * Screenshots
 * @param outputDirectory Directory to place screenshots into
 */
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
    
    await Promise.all(storybook.storyIds.map(story => openAndScreenshotStory(
        context,
        story,
        `${storybook[story].title}/${storybook[story].name}`,
        path.resolve('.reviz', outputDirectory)
    )))

    // Teardown
    await context.close()
    await browser.close()

    webServer.kill()
}

export default screenshotStories