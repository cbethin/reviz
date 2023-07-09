"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileStoryModificationsByType = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Returns { [storyName]: [fileName] }
function getStoriesFromDirectory(directory, basePath, accumulatedList) {
    const files = fs_1.default.readdirSync(directory);
    return files.reduce((acc, file) => {
        // Note: By default right now we loop through the current branch folder
        // TODO: Optimize this so it generates a list of paths before comparing
        const currentBranchPath = path_1.default.join(directory, file);
        const storyPath = currentBranchPath.replace(basePath, '');
        if (fs_1.default.lstatSync(currentBranchPath).isDirectory()) {
            return getStoriesFromDirectory(currentBranchPath, basePath, accumulatedList);
        }
        return Object.assign(Object.assign({}, acc), { [storyPath]: currentBranchPath });
    }, accumulatedList);
}
function compileStoryModificationsByType() {
    const files = getFileList('main', 'current');
    const storiesInMain = Object.keys(files.main);
    const storiesInCurrent = Object.keys(files.current);
    // New stories are ones that are in the current branch but were not on main
    const newStories = storiesInCurrent.filter(file => !storiesInMain.includes(file));
    // Missing stories are ones that were in main but are not in the current
    const missingStories = storiesInMain.filter(file => !storiesInCurrent.includes(file));
    // All other stories are ones we can compare, aka everyone in current that isn't new
    const existingStories = storiesInCurrent.filter(file => !newStories.includes(file));
    return {
        new: newStories,
        missing: missingStories,
        existing: existingStories,
    };
}
exports.compileStoryModificationsByType = compileStoryModificationsByType;
// TODO: Get a list of every file in the main and current folders
function getFileList(...directories) {
    let result = directories.reduce((acc, directory) => {
        const pathName = path_1.default.join('.reviz', directory);
        return Object.assign(Object.assign({}, acc), { [directory]: getStoriesFromDirectory(pathName, pathName, {}) });
    }, {});
    return result;
}
exports.default = getFileList;
