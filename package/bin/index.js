#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const storycap_1 = __importDefault(require("./storycap"));
const imageComparison_1 = __importDefault(require("./imageComparison"));
const chalk_1 = __importDefault(require("chalk"));
const resetBuilds_1 = __importDefault(require("./utils/resetBuilds"));
const runDevServer_1 = __importDefault(require("./runDevServer"));
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('dev', '', () => {
    (0, runDevServer_1.default)();
})
    .command({
    command: '*',
    describe: '',
    handler: (argv) => {
        var _a;
        if (argv.clear || argv.accept) {
            process.exit();
        }
        const excludedOptions = ['-v'];
        // Get arguments that were inputted via the CLI
        const inputtedArgs = process
            .argv
            .slice(2)
            .filter(arg => !excludedOptions.some((opt) => arg.startsWith(`--${opt}`) || arg.startsWith(`-${opt}`)));
        storycap_1.default.generateBuild(((_a = argv.accept) !== null && _a !== void 0 ? _a : argv.init) ? 'main' : 'current', ...inputtedArgs).then(() => {
            imageComparison_1.default.compare();
        });
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
    .option('init', {
    type: 'boolean',
    description: 'Sets the initial main build. All visual tests will be compared to this build'
})
    .help()
    .argv;
// Accept a current build by moving the current folder to the main folder
if (argv.accept) {
    if (!fs_1.default.existsSync('.reviz/current')) {
        console.error(chalk_1.default.red('Error: No build for current branch exists. Build revisions by running `reviz` before accepting.'));
        process.exit();
    }
    try {
        const mainPath = path_1.default.join('.reviz', 'main');
        const tmpMainPath = path_1.default.join('.reviz', 'tmpMain');
        const currentPath = path_1.default.join('.reviz', 'current');
        fs_1.default.mkdirSync(tmpMainPath, { recursive: true });
        fs_1.default.renameSync(mainPath, tmpMainPath);
        fs_1.default.renameSync(currentPath, mainPath);
        fs_1.default.rmSync(tmpMainPath, { recursive: true, force: true });
        (0, resetBuilds_1.default)(currentPath);
    }
    catch (error) {
        console.error('Error: Unable to accept revisions.', error);
        process.exit();
    }
    console.log('✓ Accepted current branch revisions.');
    process.exit();
}
if (argv.clear) {
    (0, resetBuilds_1.default)();
    process.exit();
}
