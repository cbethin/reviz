import { BrowserContext, chromium, devices } from "playwright"
import startHttpServer from "./startHttpServer"
import path from 'path'
import fs from 'fs'
import collectStorybookSummary from "./collectStories"
import createPathIfNeeded from "../utils/createPathIfNeeded"
import chalk from "chalk"
import log from "../utils/log"

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

    console.log(chalk.green('info'), `Snapshotting ${storyPath}`)
    
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

    log.info('Analyzing path for storybooks:', storybookStaticPath)

    if (!fs.existsSync(storybookStaticPath)) {
        console.error('Storybook build path does not exist')
        process.exit(1)
    }

    const storybook = collectStorybookSummary(storybookStaticPath)
    log.info(`Found ${storybook.storyIds.length} stories.`)

    const webServer = await startHttpServer(storybookStaticPath)
    log.info('Web server started')

    // Setup
    const browser = await chromium.launch()
    const context = await browser.newContext(devices['Desktop Chrome HiDPI'])
    
    try {
        await Promise.all(storybook.storyIds.map(story => openAndScreenshotStory(
            context,
            story,
            `${storybook[story].title}/${storybook[story].name}`,
            path.resolve('.reviz', outputDirectory)
        )))
    } catch (err) {
        log.error('Unable to snapshot story', err)
    }

    // Teardown
    await context.close()
    await browser.close()

    webServer.kill()

    log.info(`✓ Build complete.`)
}

export default screenshotStories