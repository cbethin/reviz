#! /usr/bin/env node
import fs from 'fs'
import path from 'path'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import type { Args } from './gloabl.types'

import imageComparison from './imageComparison';
import chalk from 'chalk'
import resetBuilds from './utils/resetBuilds'
import runDevServer from './runDevServer'
import screenshotStories from './screenshotStories'

const argv = yargs(hideBin(process.argv))
    .command({
        command: 'init',
        describe: 'Initializes a Reviz build',
        handler: () => {
            screenshotStories('main')
                .then(() => console.log('✓ Reviz initialized'))
                .catch(err => console.error('Unable to initialize.', err))
                .finally(() => process.exit())
        }
    })
    .command({
        command: 'review',
        describe: '',
        builder: (yargs) => yargs.option('no-open', {
            type: 'boolean',
            description: 'Will prevent the browser from automatically opening when the review server is launched',
        }),
        handler: (argv) => {
            runDevServer(!argv.noOpen)
        }
    })
    .command({
        command: '*', 
        describe: '', 
        handler: (argv) => {
            if (argv.clear || argv.accept) {
                return
            }

            const excludedOptions = ['-v']

            // Get arguments that were inputted via the CLI
            const inputtedArgs = process
                .argv
                .slice(2)
                .filter(arg => !excludedOptions.some(
                    (opt) => arg.startsWith(`--${opt}`) || arg.startsWith(`-${opt}`)
                ))

            screenshotStories('current')
                .then(() => imageComparison.compare())
                .then((summary) => {
                    if (summary.new.length !== 0 || 
                        summary.missing.length !== 0 || 
                        summary.existingWithRegressions.length !== 0
                    ) {
                        process.exit(1)
                    }

                    if (argv.review) {
                        runDevServer()
                    }
                })
                .catch(err => console.error('Unable to generate build.', err))
        }
    })
    .option('serverCmd', {
        alias: 's',
        type: 'string',
        description: 'Run server command'
    })
    .option('url', {
        alias: 'u',
        type: 'string',
        description: 'URL for storycap'
    })
    .option('accept', {
        type: 'boolean',
        description: 'Accept the regressions and reset the base expectations'
    })
    .option('clear', {
        type: 'boolean',
        description: 'Clears any build from the current branch'
    })
    .option('comparisons-only', {
        type: 'boolean',
        description: 'Compares based on an existing build. Will not regenerate build'
    })
    .option('init', {
        type: 'boolean',
        description: 'Sets the initial main build. All visual tests will be compared to this build'
    })
    .option('review', {
        type: 'boolean',
        description: 'Opens review server once build is complete'
    })
    .help()
    .argv as Args

// Accept a current build by moving the current folder to the main folder
if (argv.accept) {
    if (!fs.existsSync('.reviz/current')) {
        console.error(chalk.red('Error: No build for current branch exists. Build revisions by running `reviz` before accepting.'))
        process.exit()
    }

    try {
        const mainPath = path.join('.reviz', 'main')
        const tmpMainPath = path.join('.reviz', 'tmpMain')
        const currentPath = path.join('.reviz', 'current')

        fs.mkdirSync(tmpMainPath, { recursive: true })
        fs.renameSync(mainPath, tmpMainPath)
        fs.renameSync(currentPath, mainPath)
        fs.rmSync(tmpMainPath, { recursive: true, force: true })
        resetBuilds(currentPath)
    } catch (error) {
        console.error('Error: Unable to accept revisions.', error)
        process.exit()
    }

    console.log('✓ Accepted current branch revisions.')
    process.exit()
}

if (argv.clear) {
    resetBuilds()
    process.exit()
}

if (argv['comparisons-only']) {
    if (!fs.existsSync(path.join('.reviz', 'current'))) {
        console.error(chalk.red('Uh oh. No current build exists.'))
        process.exit()
    }

    imageComparison.compare()
    .then((summary) => {
        if (
            summary.new.length !== 0 ||
            summary.missing.length !== 0 ||
            summary.existingWithRegressions.length !== 0
        ) {
            process.exit(1)
        }
    })
    .catch(err => console.error('Could not compare images', err))
    .finally(() => process.exit())
}
