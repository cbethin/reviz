# Reviz

A visual regressions testing tool. 🧪 Reviz works off of existing Storybook builds to generate snapshots of your stories to detect visual regressions.

# Testing the Example

We provide an example package to demonstrate how Reviz works. To test out the example, run the following:

```
cd example && yarn reviz --review
```

The `--review` flag will spawn the review server so you can visualize the changes. The example project is setup with Storybook with a Button component. Modifying `Button.stories.tsx` should result in visible regressions in Reviz