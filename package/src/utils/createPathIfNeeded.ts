import path from 'path'
import fs from 'fs'

export default function createPathIfNeeded(pathname: string) {
    const diffSubfolder = path.dirname(pathname)
    
    if (!fs.existsSync(diffSubfolder)) {
        fs.mkdirSync(diffSubfolder, { recursive: true })
    }
}