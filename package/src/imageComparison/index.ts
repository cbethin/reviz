import dottedPrinter from "../utils/dottedPrinter"
import { compileStoryModificationsByType } from "./getFileList"

import fs from 'fs'
import path from 'path'
import looksSame from "looks-same"
import chalk from "chalk"
import log from "../utils/log"

async function generateImageComparison(currentImage: string, mainImage: string, storyName: string, outputDir: string) {
    const outputPath = path.join(outputDir, `${storyName}.png`)

    const { equal } = await looksSame(currentImage, mainImage, { tolerance: 30 })

    if (equal) {
        log.info(`${storyName} matches`)
        return
    }

    // Ensure the subfolders in "storybook-regressions" are created if needed
    const diffSubfolder = path.dirname(outputPath)
    if (!fs.existsSync(diffSubfolder)) {
        fs.mkdirSync(diffSubfolder, { recursive: true })
    }

    // Create the diff image
    await looksSame
        .createDiff({
            current: currentImage,
            diff: outputPath,
            highlightColor: '#ff00ff', // Customize the color if needed
            reference: mainImage,
            strict: false, // Allow small differences in the images
            tolerance: 30
        })
        .catch((err) =>
            console.warn(`Unable to create regressions visual for ${storyName}`, err),
        )

    fs.copyFileSync(currentImage, outputPath.replace('.png', '') + '_current.png')
    fs.copyFileSync(mainImage, outputPath.replace('.png', '') + '_main.png')

    log.warning(`${storyName} does not match`)
}

/**
 * Generates an summary object and writes to summary.json
 */
function generateRevizBuildSummary() {
    const summary = compileStoryModificationsByType()

    const buildSummaryPath = path.resolve('.reviz', 'summary.json')

    fs.writeFileSync(buildSummaryPath, JSON.stringify(summary), 'utf8')

    return summary
}

async function createComparisons() {
    const interval = dottedPrinter.print('Comparing current build to main')

    // Get files from main & current
    const stories = compileStoryModificationsByType()

    for (var story of Object.keys(stories.files)) {
        // Get rid of any new/missing story so we only compare images that exist in both branches
        if (stories.missing.includes(story) || stories.new.includes(story)) {
            continue
        }
        
        await generateImageComparison(
            stories.files[story].current,
            stories.files[story].main,
            story,
            path.join('.reviz', 'regressions')
        )
    }

    const summary = generateRevizBuildSummary()

    clearInterval(interval)
    process.stdout.write(chalk.gray('\rComparisons generated.\n'))

    return summary
}

export default {
    compare: createComparisons
}