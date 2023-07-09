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
        const currentBranchPath = path.join(directory, file)
        const storyPath = currentBranchPath.replace(basePath, '').replace('.png', '')

        if (fs.lstatSync(currentBranchPath).isDirectory()) {
            return getStoriesFromDirectory(currentBranchPath, basePath, accumulatedList)
        }
        
        return {
            ...acc,
            [storyPath]: currentBranchPath
        }
    }, accumulatedList)
}

type StoryModificationsByType = {
    new: StoryName[]
    missing: StoryName[]
    existing: StoryName[]
    existingWithRegressions: StoryName[]
    files: Record<StoryName, Record<DirectoryName, FileName>>
}

function getFileList(...directories: DirectoryName[]) {
    let result = directories.reduce((acc, directory) => {
        const pathName = path.join('.reviz', directory)

        if (!fs.existsSync(pathName)) {
            return {
                ...acc,
                [directory]: {}
            }
        }

        return {
            ...acc,
            [directory]: getStoriesFromDirectory(pathName, pathName, {})
        }
    }, {} as Record<DirectoryName, Record<StoryName, FileName>>)

    return result satisfies Record<DirectoryName, Record<StoryName, FileName>>
}

export function compileStoryModificationsByType(): StoryModificationsByType {
    const files = getFileList('main', 'current', 'regressions')

    const storiesInMain = Object.keys(files.main)
    const storiesInCurrent = Object.keys(files.current)
    const storiesInRegressions = Object.keys(files.regressions)

    // New stories are ones that are in the current branch but were not on main
    const newStories = storiesInCurrent.filter(story => !storiesInMain.includes(story))

    // Missing stories are ones that were in main but are not in the current
    const missingStories = storiesInMain.filter(story => !storiesInCurrent.includes(story))

    // All other stories are ones we can compare, aka everyone in current that isn't new
    const existingStories = storiesInCurrent.filter(story => !newStories.includes(story))

    const existingStoriesWithRegressions = existingStories.filter(story => storiesInRegressions.includes(story))

    const allStories = [
        ...existingStories,
        ...missingStories,
        ...newStories
    ]

    const fileNames = allStories.reduce((acc, story) => {
        return {
            ...acc,
            [story]: {
                current: files.current[story],
                main: files.main[story],
                regression: files.regressions[story]
            }
        }
    }, {})

    return {
        new: newStories,
        missing: missingStories,
        existing: existingStories,
        existingWithRegressions: existingStoriesWithRegressions,
        files: fileNames satisfies StoryModificationsByType['files']
    }
}