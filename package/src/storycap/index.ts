import { spawn } from 'child_process'
import chalk from "chalk";
import fs from 'fs'
import path from 'path'
import getFileList, { compileStoryModificationsByType } from '../imageComparison/getFileList';

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
            // console.log(`stdout: ${data}`);
        });

        storycapProcess.stderr.on('data', (data) => {
            console.error(`[Storycap] ${data}`);
        });

        // Start an interval that prints 'Storycap running...' every second
        let dots = ''
        const interval = setInterval(() => {
            dots += '.';
            process.stdout.write(`\rBuilding components${dots}`);
        }, 1000);

        storycapProcess.on('close', (code) => {
            clearInterval(interval)
            process.stdout.clearLine(0)
            process.stdout.cursorTo(0)
            process.stdout.write(chalk.gray(`\r✓ Build complete.\n`))

            generateBuiltImagesList()
            resolve()
        })
    })
}

function generateBuiltImagesList() {
    const storyToFileMap = getFileList('main', 'current')
    const stories = compileStoryModificationsByType()

    const output = {
        builtStories: storyToFileMap,
        storyRegressions: stories
    }

    const buildSummaryPath = path.resolve('.reviz', 'summary.json')

    fs.writeFileSync(buildSummaryPath, JSON.stringify(output), 'utf8')
}

export default {
    generateBuild,
    generateBuiltImagesList
}