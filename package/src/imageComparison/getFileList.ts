import fs from 'fs'
import path from 'path'

type DirectoryName = 'main' | 'current' | 'regressions'
type StoryName = string
type FileName = string

// Returns { [storyName]: [fileName] }
function getStoriesFromDirectory(directory: string, basePath: string, accumulatedList: Record<string, string>) {
    const files = fs.readdirSync(directory)

    return files.reduce((acc, file) => {
        // Note: By default right now we loop through the current branch folder
        // TODO: Optimize this so it generates a list of paths before comparing
        const currentBranchPath = path.join(directory, file)
        const storyPath = currentBranchPath.replace(basePath, '')

        if (fs.lstatSync(currentBranchPath).isDirectory()) {
            return getStoriesFromDirectory(currentBranchPath, basePath, accumulatedList)
        }
        
        return {
            ...acc,
            [storyPath]: currentBranchPath
        }
    }, accumulatedList)
}

export function compileStoryModificationsByType() {
    const files = getFileList('main', 'current')
    
    const storiesInMain = Object.keys(files.main)
    const storiesInCurrent = Object.keys(files.current)

    // New stories are ones that are in the current branch but were not on main
    const newStories = storiesInCurrent.filter(file => !storiesInMain.includes(file))

    // Missing stories are ones that were in main but are not in the current
    const missingStories = storiesInMain.filter(file => !storiesInCurrent.includes(file))

    // All other stories are ones we can compare, aka everyone in current that isn't new
    const existingStories = storiesInCurrent.filter(file => !newStories.includes(file))

    return {
        new: newStories,
        missing: missingStories,
        existing: existingStories,
    }
}

// TODO: Get a list of every file in the main and current folders
export default function getFileList(...directories: DirectoryName[]) {
    let result = directories.reduce((acc, directory) => {
        const pathName = path.join('.reviz', directory)
        return {
            ...acc,
            [directory]: getStoriesFromDirectory(pathName, pathName, {})
        }
    }, {} as Record<DirectoryName, Record<StoryName, FileName>>)

    return result satisfies Record<DirectoryName, Record<StoryName, FileName>>
} 