"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function print(text, intervalMs = 1000) {
    let dots = '';
    const interval = setInterval(() => {
        dots += '.';
        if (dots === '....') {
            dots = '.';
        }
        process.stdout.write(`\r${text}${dots}`);
    }, intervalMs);
    return interval;
}
exports.default = {
    print
};
