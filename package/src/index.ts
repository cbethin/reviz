#! /usr/bin/env node

import chalk from 'chalk';
import { spawn } from 'child_process'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

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
    .help()
    .argv


const excludedOptions = ['-v']

// Get arguments that were inputted via the CLI
const inputtedArgs = process
    .argv
    .slice(2)
    .filter(arg => !excludedOptions.some(
        (opt) => arg.startsWith(`--${opt}`) || arg.startsWith(`-${opt}`)
    ))

// List out the arguments for the command we want to spawn
const commandArgs = [
    'storycap',
    '--serverCmd',
    'storybook dev -p 9001 --no-open',
    'http://localhost:9001',
]

const storycapProcess = spawn('npx', [
    ...commandArgs,
    ...inputtedArgs
])

storycapProcess.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
});

storycapProcess.stderr.on('data', (data) => {
    console.error(`[Storycap] ${data}`);
});

// Start an interval that prints 'Storycap running...' every second
let dots = ''
const interval = setInterval(() => {
    dots += '.';
    process.stdout.write(`\rStorycap running${dots}`);
}, 1000);

storycapProcess.on('close', (code) => {
    clearInterval(interval)
    process.stdout.write('\r' + chalk.green(`✓ Storycap complete.`))
})