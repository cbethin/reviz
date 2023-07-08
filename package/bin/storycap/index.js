"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
function generateBuild(outputDir, ...args) {
    // List out the arguments for the command we want to spawn
    const commandArgs = [
        'storycap',
        '--serverCmd',
        'storybook dev -p 9001 --no-open',
        '-o',
        `.reviz/${outputDir}`,
        'http://localhost:9001',
    ];
    const storycapProcess = (0, child_process_1.spawn)('npx', [
        ...commandArgs,
        ...args,
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
}
exports.default = {
    generateBuild
};
