import path from 'path'
import { spawn, ChildProcessWithoutNullStreams } from 'child_process'

export default function startHttpServer() {
    const storybookStaticPath = path.resolve('./storybook-static')

    return new Promise<ChildProcessWithoutNullStreams>(resolve => {
        const args = [
            'http-server',
            storybookStaticPath,
            '-p',
            '6006'
        ]

        let webServer = spawn('npx', args)

        webServer.stdout.on('data', data => {
            if (data.includes('Hit CTRL-C to stop the server')) {
                resolve(webServer)
            }
        })

        webServer.stderr.on('error', data => process.stderr.write('Error:' + data))
    })
}