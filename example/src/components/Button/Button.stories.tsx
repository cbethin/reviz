import type { Meta, StoryObj } from '@storybook/react'
import Button from "."

export default {
    title: 'Components/Button',
    component: Button,
    args: {
        text: 'Click me'
    }
} as Meta<typeof Button>

export const Basic: StoryObj<typeof Button> = { }