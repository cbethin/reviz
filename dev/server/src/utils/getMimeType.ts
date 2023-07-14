import path from 'path'

export default function getMimeType(filePath) {
    const extname = path.extname(filePath);
    switch (extname.toLowerCase()) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        // Add more cases for other file types if needed
        default:
            return 'application/octet-stream';
    }
}