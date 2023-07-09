"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
function default_1() {
    return new Promise((resolve) => {
        const devServer = (0, child_process_1.spawn)('reviz-dev-server');
        devServer.stdout.on('data', (data) => {
            console.log(`[Reviz Dev Server] ${data}`);
        });
        devServer.stderr.on('data', (data) => {
            console.error(`[Reviz Dev Server] ${data}`);
        });
        devServer.on('close', (code) => {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(chalk_1.default.gray(`\r✓ Build complete.`));
            resolve();
        });
    });
}
exports.default = default_1;
