/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const looksSame = require('looks-same')
const chalk = require('chalk')

const currentBranchFolder = path.join('.reviz', 'current')
const mainBranchFolder = path.join('.reviz', 'main')
const regressionsBranchFolder = path.join('.reviz', 'regressions')

async function compareImages(directory: string = currentBranchFolder) {
    const files = fs.readdirSync(directory)

    files.forEach(async file => {
        // Note: By default right now we loop through the current branch folder
        // TODO: Optimize this so it generates a list of paths before comparing
        const currentBranchPath = path.join(directory, file)
        const storyPath = currentBranchPath.replace(currentBranchFolder, '')

        const mainBranchPath = path.join(
            mainBranchFolder,
            storyPath,
        )
        const regressionsPath = path.join(
            regressionsBranchFolder,
            storyPath,
        )

        if (fs.lstatSync(currentBranchPath).isDirectory()) {
            compareImages(currentBranchPath)
            return
        }

        try {
            const { equal } = await looksSame(currentBranchPath, mainBranchPath)

            if (equal) {
                console.log(chalk.green(`${storyPath} matches`))
                return
            }

            // Ensure the subfolders in "storybook-regressions" are created if needed
            const diffSubfolder = path.dirname(regressionsPath)
            if (!fs.existsSync(diffSubfolder)) {
                fs.mkdirSync(diffSubfolder, { recursive: true })
            }

            // Create the diff image
            looksSame
                .createDiff({
                    current: currentBranchPath,
                    diff: regressionsPath,
                    highlightColor: '#ff00ff', // Customize the color if needed
                    reference: mainBranchPath,
                    strict: false, // Allow small differences in the images
                })
                .catch((err) =>
                    console.warn(`Unable to create regressions visual for ${storyPath}`, err),
                )

            fs.copyFileSync(currentBranchPath, regressionsPath.replace('.png', '') + '_current.png')
            fs.copyFileSync(mainBranchPath, regressionsPath.replace('.png', '') + '_master.png')

            console.log(chalk.red(`${storyPath} does not match`))
        } catch(error) {
            throw new Error(`Unable to compare ${storyPath}. ${error}`)
        }
    })

}

export default {
    compare: compareImages
}