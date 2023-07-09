import dottedPrinter from "../utils/dottedPrinter"
import getFileList, { compileStoryModificationsByType } from "./getFileList"

import fs from 'fs'
import path from 'path'
import looksSame from "looks-same"
import chalk from "chalk"

async function generateImageComparison(currentImage: string, mainImage: string, storyName: string, outputDir: string) {
    const outputPath = path.join(outputDir, storyName)

    const { equal } = await looksSame(currentImage, mainImage)

    if (equal) {
        console.log(chalk.green(`${storyName} matches`))
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
        })
        .catch((err) =>
            console.warn(`Unable to create regressions visual for ${storyName}`, err),
        )

    fs.copyFileSync(currentImage, outputPath.replace('.png', '') + '_current.png')
    fs.copyFileSync(mainImage, outputPath.replace('.png', '') + '_main.png')

    console.log(chalk.red(`${storyName} does not match`))
}

async function createComparisons() {
    const interval = dottedPrinter.print('Comparing current build to main')

    // Get files from main & current
    const storyToFileMap = getFileList('main', 'current')
    const stories = compileStoryModificationsByType()

    for (var story of Object.keys(storyToFileMap.current)) {
        // Get rid of any new/missing story so we only compare images that exist in both branches
        if (stories.missing.includes(story) || stories.new.includes(story)) {
            continue
        }
        
        await generateImageComparison(
            storyToFileMap.current[story],
            storyToFileMap.main[story],
            story,
            path.join('.reviz', 'regressions')
        )
    }

    clearInterval(interval)
    process.stdout.write(chalk.gray('\r✓ Comparisons generated.'))
}

export default {
    compare: createComparisons,
    list: getFileList
}