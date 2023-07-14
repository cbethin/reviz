import { useEffect, useState } from "react"

type ImageDirectory = 'main' | 'current' | 'regression'
type StoryName = string
type ImageFileName = string

interface ChangedStories {
    new: StoryName[]
    existing: StoryName[]
    existingWithRegressions: StoryName[]
    missing: StoryName[]
    files: Record<StoryName, Record<ImageDirectory, ImageFileName>>
}

export default function useStories() {
    const [stories, setStories] = useState<ChangedStories>()

    useEffect(() => {
        fetch('/stories-list', { cache: 'no-store' })
            .then(res => res.json())
            .then(setStories)
    }, [])

    const isMissingOnThisBranch = (story: string) => {
        return stories?.missing.includes(story)
    }

    const isNewOnThisBranch = (story: string) => {
        return stories?.new.includes(story)
    }

    const getImageUrl = (story: string) => {
        return stories?.files[story]?.regression ?? stories?.files[story]?.main ?? stories?.files[story]?.current
    }

    return {
        stories,
        utils: {
            getImageUrl,
            isMissingOnThisBranch,
            isNewOnThisBranch
        }
    }
}