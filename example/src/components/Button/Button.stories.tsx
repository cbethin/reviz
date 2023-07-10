import type { Meta, StoryObj } from '@storybook/react'
import Button from "."

export default {
    title: 'Components/Button',
    component: Button,
    args: {
        text: ''
    }
} as Meta<typeof Button>

export const Basic: StoryObj<typeof Button> = { }

export const AnotherOne: StoryObj<typeof Button> = {
    args: {
        text: 'Click me 2'
    }
}