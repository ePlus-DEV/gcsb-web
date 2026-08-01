# Arcade Points by ePlus.DEV

A web calculator and extension landing page for Google Skills Arcade learners.

Production site: https://arcade.eplus.dev/

## Features

- Analyze a public `skills.google/public_profiles/...` URL.
- Display total points, game/trivia badges, Skill Badges and tier progress.
- Explore returned badges and scoring confidence.
- Fall back to manual entry when the crawler is unavailable.
- Save the latest result in `localStorage`.
- Promote the open-source Google Cloud Skills Boost Helper extension.

## Development

```bash
yarn install --frozen-lockfile
yarn dev
yarn typecheck
yarn lint
yarn build
```

Use plain `yarn install` only when intentionally updating dependencies and commit the resulting `yarn.lock` changes.

Runtime service configuration is intentionally not documented publicly. Keep backend endpoints, access keys, and other deployment secrets in the private deployment environment rather than in repository documentation or client-exposed variables.

## Related project

- Extension: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper

This is an unofficial community tool and is not affiliated with Google.
