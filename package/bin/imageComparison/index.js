"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const looksSame = require('looks-same');
const chalk = require('chalk');
const currentBranchFolder = path.join('.reviz', 'current');
const mainBranchFolder = path.join('.reviz', 'main');
const regressionsBranchFolder = path.join('.reviz', 'regressions');
function compareImages(directory = currentBranchFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fs.readdirSync(directory);
        files.forEach((file) => __awaiter(this, void 0, void 0, function* () {
            // Note: By default right now we loop through the current branch folder
            // TODO: Optimize this so it generates a list of paths before comparing
            const currentBranchPath = path.join(directory, file);
            const storyPath = currentBranchPath.replace(currentBranchFolder, '');
            const mainBranchPath = path.join(mainBranchFolder, storyPath);
            const regressionsPath = path.join(regressionsBranchFolder, storyPath);
            if (fs.lstatSync(currentBranchPath).isDirectory()) {
                compareImages(currentBranchPath);
                return;
            }
            try {
                const { equal } = yield looksSame(currentBranchPath, mainBranchPath);
                if (equal) {
                    console.log(chalk.green(`${storyPath} matches`));
                    return;
                }
                // Ensure the subfolders in "storybook-regressions" are created if needed
                const diffSubfolder = path.dirname(regressionsPath);
                if (!fs.existsSync(diffSubfolder)) {
                    fs.mkdirSync(diffSubfolder, { recursive: true });
                }
                // Create the diff image
                looksSame
                    .createDiff({
                    current: currentBranchPath,
                    diff: regressionsPath,
                    highlightColor: '#ff00ff',
                    reference: mainBranchPath,
                    strict: false, // Allow small differences in the images
                })
                    .catch((err) => console.warn(`Unable to create regressions visual for ${storyPath}`, err));
                fs.copyFileSync(currentBranchPath, regressionsPath.replace('.png', '') + '_current.png');
                fs.copyFileSync(mainBranchPath, regressionsPath.replace('.png', '') + '_main.png');
                console.log(chalk.red(`${storyPath} does not match`));
            }
            catch (error) {
                throw new Error(`Unable to compare ${storyPath}. ${error}`);
            }
        }));
    });
}
exports.default = {
    compare: compareImages
};
