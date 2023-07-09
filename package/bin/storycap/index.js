"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getFileList_1 = __importStar(require("../imageComparison/getFileList"));
function generateBuild(outputDir, ...args) {
    return new Promise((resolve) => {
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
            process.stdout.write(`\rBuilding components${dots}`);
        }, 1000);
        storycapProcess.on('close', (code) => {
            clearInterval(interval);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(chalk_1.default.gray(`\r✓ Build complete.\n`));
            generateBuiltImagesList();
            resolve();
        });
    });
}
function generateBuiltImagesList() {
    const storyToFileMap = (0, getFileList_1.default)('main', 'current');
    const stories = (0, getFileList_1.compileStoryModificationsByType)();
    const output = {
        builtStories: storyToFileMap,
        storyRegressions: stories
    };
    const buildSummaryPath = path_1.default.resolve('.reviz', 'summary.json');
    fs_1.default.writeFileSync(buildSummaryPath, JSON.stringify(output), 'utf8');
}
exports.default = {
    generateBuild,
    generateBuiltImagesList
};
