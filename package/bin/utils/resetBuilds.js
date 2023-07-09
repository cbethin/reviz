"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function resetBuilds(currentPath = path_1.default.join('.reviz', 'current'), regressionsPath = path_1.default.join('.reviz', 'regressions'), summaryPath = path_1.default.join('.reviz', 'summary.json')) {
    try {
        fs_1.default.rmSync(summaryPath, { force: true });
        fs_1.default.rmSync(currentPath, { recursive: true, force: true });
        fs_1.default.rmSync(regressionsPath, { recursive: true, force: true });
    }
    catch (error) {
        console.error('Error: Unable to clear builds.');
        throw new Error('Unable to clear builds ' + error);
    }
    console.log(chalk_1.default.gray('✓ Cleared build for current branch.'));
}
exports.default = resetBuilds;
