#! /usr/bin/env node

import chalk from 'chalk';
import { exec } from 'child_process'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

import type { Args } from './gloabl.types'

import storycap from './storycap'

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

// Clear the .reviz/current folder if we're accepting or clearing a build
if (argv.accept || argv.clear) {
    exec('rm -rf .reviz/current', (error) => {
        if (error) {
            console.error("Unable to delete current build", error)
        }
    })

    if (argv.clear) {
        process.exit()
    }
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
)