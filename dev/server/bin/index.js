#! /usr/bin/env node
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
const revizDirectory = path_1.default.resolve('.reviz');
const imagesDirectory = path_1.default.resolve('.reviz', 'regressions'); // replace 'images' with your folder path
const reactBuildPath = path_1.default.resolve(__dirname, './app/build');
app.use(express_1.default.static(reactBuildPath));
app.get('/stories-list', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jsonData = fs_1.default.readFileSync(path_1.default.join(revizDirectory, 'summary.json'), 'utf8');
    const summary = JSON.parse(jsonData);
    res.send(summary);
}));
app.get('/images/*', (req, res) => {
    const imagePath = req.params[0]; // Get the path after '/images/'
    const resolvedPath = path_1.default.resolve(imagePath);
    if (!fs_1.default.existsSync(imagePath)) {
        res.status(500);
        return;
    }
    res.sendFile(resolvedPath, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('File not found');
        }
    });
});
app.listen(port, () => {
    console.log(`Image server listening at http://localhost:${port}`);
});
