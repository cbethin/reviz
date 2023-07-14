import { spawn } from 'child_process'
import chalk from "chalk";
import readline from 'readline'

function generateBuild(outputDir: string, ...args: string[]) {
    return new Promise<void>((resolve) => {
        // List out the arguments for the command we want to spawn
        const commandArgs = [
            'storycap',
            '--serverCmd',
            'storybook dev -p 9001 --no-open',
            '-o',
            `.reviz/${outputDir}`,
            'http://localhost:9001',
        ]

        const storycapProcess = spawn('npx', [
            ...commandArgs,
            ...args,
        ])

        storycapProcess.stdout.on('data', (data) => {
            process.stdout.write(chalk.gray(`[Storycap] ${data}`))
        });

        storycapProcess.stderr.on('data', (data) => {
            process.stderr.write(chalk.red(`[Storycap] ${data}`))
        });

        console.log('Building components')

        storycapProcess.on('close', (code) => {
            console.log(`✓ Build complete.`)
            resolve()
        })
    })
}

export default {
    generateBuild,
}