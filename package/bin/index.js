#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
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
    .argv;
const excludedOptions = ['-v'];
// Get arguments that were inputted via the CLI
const inputtedArgs = process
    .argv
    .slice(2)
    .filter(arg => !excludedOptions.some((opt) => arg.startsWith(`--${opt}`) || arg.startsWith(`-${opt}`)));
// List out the arguments for the command we want to spawn
const commandArgs = [
    'storycap',
    '--serverCmd',
    'storybook dev -p 9001 --no-open',
    'http://localhost:9001',
];
console.log({ commandArgs, inputtedArgs });
const storycapProcess = (0, child_process_1.spawn)('npx', [
    ...commandArgs,
    ...inputtedArgs
]);
storycapProcess.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
});
storycapProcess.stderr.on('data', (data) => {
    console.error(`[Storycap] ${data}`);
});
// Start an interval that prints 'Storycap running...' every second
let dots = '';
const interval = setInterval(() => {
    dots += '.';
    process.stdout.write(`\rStorycap running${dots}`);
}, 1000);
storycapProcess.on('close', (code) => {
    clearInterval(interval);
    process.stdout.write('\r' + chalk_1.default.green(`✓ Storycap complete.`));
});
