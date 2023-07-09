import { Request, Response } from "express";

import express from 'express'
import fs from 'fs'
import path from 'path'

const app = express();
const port = 3001;
const imagesDirectory = path.resolve('.reviz', 'regressions'); // replace 'images' with your folder path
const reactBuildPath = path.resolve(__dirname, './app/build')

app.use(express.static(reactBuildPath))

// Recursive function to get all file paths
async function getFilePaths(dirPath) {
    if (!fs.existsSync(imagesDirectory)) {
        return []
    }

    let entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    // Get files within the current directory and add a path prefix
    let filePaths = entries
        .filter(file => !file.isDirectory())
        .map(file =>  path.relative(imagesDirectory, `${dirPath}/${file.name}`))

    // Loop through each subdirectory using recursion
    let subDirFiles = await Promise.all(
        entries.filter(file => file.isDirectory()).map(file => getFilePaths(`${dirPath}/${file.name}`))
    );

    // Combine the array of file paths (from the files and the subdirectories)
    return filePaths.concat(...subDirFiles);
}

app.get('/image-list', async (req, res) => {
    try {
        let imageFiles = (await getFilePaths(imagesDirectory))
            .map(
                file => file.replace(imagesDirectory, '')
            )
            .filter(
                file => !file.includes('_main') && !file.includes('_current')
            )
                
        let storyNames = Array.from(new Set(imageFiles.map(
            file => file
                .replace('.png', '')
                .replace('_current', '')
                .replace('_main', '')
        )))

        res.json({
            files: imageFiles,
            stories: storyNames
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error reading images directory.");
    }
})

app.get('/images/*', (req, res) => {
    const imagePath = req.params[0]; // Get the path after '/images/'

    const filePath = path.join(imagesDirectory, imagePath);
    const fullPath = path.resolve(filePath);
    const relativePath = path.relative(imagesDirectory, fullPath);
    
    res.sendFile(relativePath, { root: imagesDirectory }, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('File not found');
        }
    });
})

app.listen(port, () => {
    console.log(`Image server listening at http://localhost:${port}`);
});
