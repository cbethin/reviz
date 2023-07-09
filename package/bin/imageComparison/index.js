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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dottedPrinter_1 = __importDefault(require("../utils/dottedPrinter"));
const getFileList_1 = require("./getFileList");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const looks_same_1 = __importDefault(require("looks-same"));
const chalk_1 = __importDefault(require("chalk"));
function generateImageComparison(currentImage, mainImage, storyName, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputPath = path_1.default.join(outputDir, `${storyName}.png`);
        const { equal } = yield (0, looks_same_1.default)(currentImage, mainImage);
        if (equal) {
            console.log(chalk_1.default.green(`${storyName} matches`));
            return;
        }
        // Ensure the subfolders in "storybook-regressions" are created if needed
        const diffSubfolder = path_1.default.dirname(outputPath);
        if (!fs_1.default.existsSync(diffSubfolder)) {
            fs_1.default.mkdirSync(diffSubfolder, { recursive: true });
        }
        // Create the diff image
        yield looks_same_1.default
            .createDiff({
            current: currentImage,
            diff: outputPath,
            highlightColor: '#ff00ff',
            reference: mainImage,
            strict: false, // Allow small differences in the images
        })
            .catch((err) => console.warn(`Unable to create regressions visual for ${storyName}`, err));
        fs_1.default.copyFileSync(currentImage, outputPath.replace('.png', '') + '_current.png');
        fs_1.default.copyFileSync(mainImage, outputPath.replace('.png', '') + '_main.png');
        console.log(chalk_1.default.red(`${storyName} does not match`));
    });
}
/**
 * Generates an summary object and writes to summary.json
 */
function generateRevizBuildSummary() {
    const summary = (0, getFileList_1.compileStoryModificationsByType)();
    const buildSummaryPath = path_1.default.resolve('.reviz', 'summary.json');
    fs_1.default.writeFileSync(buildSummaryPath, JSON.stringify(summary), 'utf8');
}
function createComparisons() {
    return __awaiter(this, void 0, void 0, function* () {
        const interval = dottedPrinter_1.default.print('Comparing current build to main');
        // Get files from main & current
        const stories = (0, getFileList_1.compileStoryModificationsByType)();
        for (var story of Object.keys(stories.files)) {
            // Get rid of any new/missing story so we only compare images that exist in both branches
            if (stories.missing.includes(story) || stories.new.includes(story)) {
                continue;
            }
            yield generateImageComparison(stories.files[story].current, stories.files[story].main, story, path_1.default.join('.reviz', 'regressions'));
        }
        generateRevizBuildSummary();
        clearInterval(interval);
        process.stdout.write(chalk_1.default.gray('\r✓ Comparisons generated.'));
    });
}
exports.default = {
    compare: createComparisons
};
