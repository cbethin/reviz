import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

export default function resetBuilds(
    currentPath = path.join('.reviz', 'current'),
    regressionsPath = path.join('.reviz', 'regressions'),
    summaryPath = path.join('.reviz', 'summary.json')
) {

    try {
        fs.rmSync(summaryPath, { force: true })
        fs.rmSync(currentPath, { recursive: true, force: true })
        fs.rmSync(regressionsPath, { recursive: true, force: true })
    } catch (error) {
        console.error('Error: Unable to clear builds.')
        throw new Error('Unable to clear builds ' + error)
    }

    console.log(chalk.gray('✓ Cleared build for current branch.'))
}