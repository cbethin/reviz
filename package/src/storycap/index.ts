import { spawn } from 'child_process'
import chalk from "chalk";

function generateBuild(outputDir: string, ...args: string[]) {
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
        process.stdout.write('\r' + chalk.green(`✓ Build complete.`))
    })
}

export default {
    generateBuild
}