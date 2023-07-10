import { Request, Response } from "express";

import express from 'express'
import fs from 'fs'
import path from 'path'

const app = express();
const port = 3001;

const revizDirectory = path.resolve('.reviz')
const imagesDirectory = path.resolve('.reviz', 'regressions'); // replace 'images' with your folder path
const reactBuildPath = path.resolve(__dirname, './app/build')

app.use(express.static(reactBuildPath))

app.get('/stories-list', async (req, res) => {
    const jsonData = fs.readFileSync(path.join(revizDirectory, 'summary.json'), 'utf8')
    const summary = JSON.parse(jsonData)

    res.send(summary)
})

app.get('/images/*', (req, res) => {
    const imagePath = req.params[0]; // Get the path after '/images/'
    
    const resolvedPath = path.resolve(imagePath)

    if (!fs.existsSync(imagePath)) {
        res.status(500)
        return
    }

    res.sendFile(resolvedPath, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('File not found');
        }
    })
})

app.listen(port, () => {
    console.log(`Image server listening at http://localhost:${port}`);
});
