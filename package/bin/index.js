#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const storycap_1 = __importDefault(require("./storycap"));
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
    .argv;
if (argv.accept || argv.clear) {
    (0, child_process_1.exec)('rm -rf .reviz/current', (error) => {
        if (error) {
            console.error("Unable to delete current build", error);
        }
    });
    if (argv.clear) {
        process.exit();
    }
}
const excludedOptions = ['-v'];
// Get arguments that were inputted via the CLI
const inputtedArgs = process
    .argv
    .slice(2)
    .filter(arg => !excludedOptions.some((opt) => arg.startsWith(`--${opt}`) || arg.startsWith(`-${opt}`)));
storycap_1.default.generateBuild(((_a = argv.accept) !== null && _a !== void 0 ? _a : argv.init) ? 'main' : 'current', ...inputtedArgs);
