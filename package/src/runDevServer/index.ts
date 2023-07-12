import chalk from 'chalk';
import { spawn } from 'child_process'
import open from 'open'
import readline from 'readline'

export default function(openBrowser: boolean = true) {
    return new Promise<void>((resolve) => {
        const devServer = spawn('reviz-dev-server')

        if (openBrowser) {
            open('http://localhost:3001')
        }

        devServer.stdout.on('data', async (data) => {
            console.log(`[Reviz Dev Server] ${data}`);
        });

        devServer.stderr.on('data', (data) => {
            console.error(`[Reviz Dev Server] ${data}`);
        });

        devServer.on('close', (code) => {
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0, 1)
            process.stdout.clearLine(0)
            process.stdout.cursorTo(0)
            process.stdout.write(chalk.gray(`\r✓ Build complete.`))
            resolve()
        })
    })
}