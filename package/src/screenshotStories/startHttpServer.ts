import path from 'path'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import log from '../utils/log'

export default function startHttpServer(storybookBuildPath: string) {
    return new Promise<ChildProcessWithoutNullStreams>(resolve => {
        const args = [
            'http-server',
            storybookBuildPath,
            '-p',
            '6006'
        ]

        let webServer = spawn('npx', args)

        webServer.stdout.on('data', data => {
            if (data.includes('Hit CTRL-C to stop the server')) {
                resolve(webServer)
            }
        })

        webServer.stderr.on('data', data => {
            log.error(`Error found on storybook server: ${data}`,)
        })
    })
}