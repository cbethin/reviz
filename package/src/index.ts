#! /usr/bin/env node
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import type { Args } from './gloabl.types'

import storycap from './storycap'
import imageComparison from './imageComparison';
import chalk from 'chalk'
import resetBuilds from './utils/resetBuilds'

const argv = yargs(hideBin(process.argv))
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
    .option('init', {
        type: 'boolean',
        description: 'Sets the initial main build. All visual tests will be compared to this build'
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
    } catch(error) {
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


const excludedOptions = ['-v']

// Get arguments that were inputted via the CLI
const inputtedArgs = process
    .argv
    .slice(2)
    .filter(arg => !excludedOptions.some(
        (opt) => arg.startsWith(`--${opt}`) || arg.startsWith(`-${opt}`)
    ))


storycap.generateBuild(
    (argv.accept ?? argv.init) ? 'main' : 'current',
    ...inputtedArgs
).then(() => {
    imageComparison.compare()
})