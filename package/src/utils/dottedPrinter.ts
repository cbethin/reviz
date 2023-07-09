function print(text: string, intervalMs: number = 1000) {
    let dots = '';

    const interval = setInterval(() => {
        dots += '.'
        if (dots === '....') {
            dots = '.'
        }
        
        process.stdout.write(`\r${text}${dots}`)
    }, intervalMs)

    return interval
}

export default {
    print
}