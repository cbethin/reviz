import chalk from "chalk"

export default {
    info(...args: string[]) {
        console.log(chalk.green('info'), ...args)
    },
    error(...args: string[]) {
        console.error(chalk.red('Error:'), ...args)
    },
    warning(...args: string[]) {
        console.warn(chalk.yellow('Warning:'), ...args)
    }
}