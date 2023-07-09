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
const getFileList_1 = __importStar(require("./getFileList"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const looks_same_1 = __importDefault(require("looks-same"));
const chalk_1 = __importDefault(require("chalk"));
function generateImageComparison(currentImage, mainImage, storyName, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputPath = path_1.default.join(outputDir, storyName);
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
function createComparisons() {
    return __awaiter(this, void 0, void 0, function* () {
        const interval = dottedPrinter_1.default.print('Comparing current build to main');
        // Get files from main & current
        const storyToFileMap = (0, getFileList_1.default)('main', 'current');
        const stories = (0, getFileList_1.compileStoryModificationsByType)();
        for (var story of Object.keys(storyToFileMap.current)) {
            // Get rid of any new/missing story so we only compare images that exist in both branches
            if (stories.missing.includes(story) || stories.new.includes(story)) {
                continue;
            }
            yield generateImageComparison(storyToFileMap.current[story], storyToFileMap.main[story], story, path_1.default.join('.reviz', 'regressions'));
        }
        clearInterval(interval);
        process.stdout.write(chalk_1.default.gray('\r✓ Comparisons generated.'));
    });
}
exports.default = {
    compare: createComparisons,
    list: getFileList_1.default
};
