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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3001;
const imagesDirectory = path_1.default.resolve('.reviz', 'regressions'); // replace 'images' with your folder path
const reactBuildPath = path_1.default.resolve(__dirname, './app/build');
app.use(express_1.default.static(reactBuildPath));
// Recursive function to get all file paths
function getFilePaths(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(imagesDirectory)) {
            return [];
        }
        let entries = yield fs_1.default.promises.readdir(dirPath, { withFileTypes: true });
        // Get files within the current directory and add a path prefix
        let filePaths = entries
            .filter(file => !file.isDirectory())
            .map(file => path_1.default.relative(imagesDirectory, `${dirPath}/${file.name}`));
        // Loop through each subdirectory using recursion
        let subDirFiles = yield Promise.all(entries.filter(file => file.isDirectory()).map(file => getFilePaths(`${dirPath}/${file.name}`)));
        // Combine the array of file paths (from the files and the subdirectories)
        return filePaths.concat(...subDirFiles);
    });
}
app.get('/image-list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let imageFiles = (yield getFilePaths(imagesDirectory))
            .map(file => file.replace(imagesDirectory, ''))
            .filter(file => !file.includes('_main') && !file.includes('_current'));
        let storyNames = Array.from(new Set(imageFiles.map(file => file
            .replace('.png', '')
            .replace('_current', '')
            .replace('_main', ''))));
        res.json({
            files: imageFiles,
            stories: storyNames
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Error reading images directory.");
    }
}));
app.get('/images/*', (req, res) => {
    const imagePath = req.params[0]; // Get the path after '/images/'
    const filePath = path_1.default.join(imagesDirectory, imagePath);
    const fullPath = path_1.default.resolve(filePath);
    const relativePath = path_1.default.relative(imagesDirectory, fullPath);
    res.sendFile(relativePath, { root: imagesDirectory }, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('File not found');
        }
    });
});
app.listen(port, () => {
    console.log(`Image server listening at http://localhost:${port}`);
});
