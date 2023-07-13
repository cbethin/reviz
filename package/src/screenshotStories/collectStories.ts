import path from 'path'
import fs from 'fs'

type StoryName = string

interface StoriesObject {
    v: number,
    stories: Record<StoryName, {
        id: string,
        title: string
        name: string,
    }>
}

export default function collectStorybookSummary(storybookBuildPath: string) {
    const storiesJsonPath = path.resolve(storybookBuildPath, 'stories.json')

    const storiesJson: StoriesObject = JSON.parse(fs.readFileSync(storiesJsonPath, 'utf8'))

    return {
        ...storiesJson.stories,
        storyIds: Object.keys(storiesJson.stories)
    }
}