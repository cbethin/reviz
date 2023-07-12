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
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const open_1 = __importDefault(require("open"));
const readline_1 = __importDefault(require("readline"));
function default_1(openBrowser = true) {
    return new Promise((resolve) => {
        const devServer = (0, child_process_1.spawn)('reviz-dev-server');
        if (openBrowser) {
            (0, open_1.default)('http://localhost:3001');
        }
        devServer.stdout.on('data', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log(`[Reviz Dev Server] ${data}`);
        }));
        devServer.stderr.on('data', (data) => {
            console.error(`[Reviz Dev Server] ${data}`);
        });
        devServer.on('close', (code) => {
            readline_1.default.clearLine(process.stdout, 0);
            readline_1.default.cursorTo(process.stdout, 0, 1);
            process.stdout.write(chalk_1.default.gray(`\r✓ Build complete.`));
            resolve();
        });
    });
}
exports.default = default_1;
