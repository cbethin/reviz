import chalk from 'chalk';
import { spawn } from 'child_process'

export default function() {
    return new Promise<void>((resolve) => {
        const devServer = spawn('reviz-dev-server')

        devServer.stdout.on('data', (data) => {
            console.log(`[Reviz Dev Server] ${data}`);
        });

        devServer.stderr.on('data', (data) => {
            console.error(`[Reviz Dev Server] ${data}`);
        });

        devServer.on('close', (code) => {
            process.stdout.clearLine(0)
            process.stdout.cursorTo(0)
            process.stdout.write(chalk.gray(`\r✓ Build complete.`))
            resolve()
        })
    })
}