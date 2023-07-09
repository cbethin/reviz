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
        const currentBranchPath = path_1.default.join(directory, file);
        const storyPath = currentBranchPath.replace(basePath, '').replace('.png', '');
        if (fs_1.default.lstatSync(currentBranchPath).isDirectory()) {
            return getStoriesFromDirectory(currentBranchPath, basePath, accumulatedList);
        }
        return Object.assign(Object.assign({}, acc), { [storyPath]: currentBranchPath });
    }, accumulatedList);
}
function getFileList(...directories) {
    let result = directories.reduce((acc, directory) => {
        const pathName = path_1.default.join('.reviz', directory);
        if (!fs_1.default.existsSync(pathName)) {
            return Object.assign(Object.assign({}, acc), { [directory]: {} });
        }
        return Object.assign(Object.assign({}, acc), { [directory]: getStoriesFromDirectory(pathName, pathName, {}) });
    }, {});
    return result;
}
function compileStoryModificationsByType() {
    const files = getFileList('main', 'current', 'regressions');
    const storiesInMain = Object.keys(files.main);
    const storiesInCurrent = Object.keys(files.current);
    const storiesInRegressions = Object.keys(files.regressions);
    // New stories are ones that are in the current branch but were not on main
    const newStories = storiesInCurrent.filter(story => !storiesInMain.includes(story));
    // Missing stories are ones that were in main but are not in the current
    const missingStories = storiesInMain.filter(story => !storiesInCurrent.includes(story));
    // All other stories are ones we can compare, aka everyone in current that isn't new
    const existingStories = storiesInCurrent.filter(story => !newStories.includes(story));
    const existingStoriesWithRegressions = existingStories.filter(story => storiesInRegressions.includes(story));
    const allStories = [
        ...existingStories,
        ...missingStories,
        ...newStories
    ];
    const fileNames = allStories.reduce((acc, story) => {
        return Object.assign(Object.assign({}, acc), { [story]: {
                current: files.current[story],
                main: files.main[story],
                regression: files.regressions[story]
            } });
    }, {});
    return {
        new: newStories,
        missing: missingStories,
        existing: existingStories,
        existingWithRegressions: existingStoriesWithRegressions,
        files: fileNames
    };
}
exports.compileStoryModificationsByType = compileStoryModificationsByType;
