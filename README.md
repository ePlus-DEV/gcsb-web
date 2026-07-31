# Arcade Points by ePlus.DEV

A web calculator and extension landing page for Google Skills Arcade learners.

## Features

- Analyze a public `skills.google/public_profiles/...` URL.
- Display total points, game/trivia badges, Skill Badges and tier progress.
- Explore returned badges and scoring confidence.
- Fall back to manual entry when the crawler is unavailable.
- Save the latest result in `localStorage`.
- Promote the open-source Google Cloud Skills Boost Helper extension.

## API

The static frontend calls the public, rate-limited crawler endpoint maintained by `hub.eplus.dev`:

```text
POST https://hub.eplus.dev/api/arcade-public
Content-Type: application/json

{
  "url": "https://www.skills.google/public_profiles/PROFILE_ID",
  "season": "2026"
}
```

Override the endpoint at build time when needed:

```bash
NEXT_PUBLIC_ARCADE_API_URL=https://example.com/api/arcade-public yarn build
```

Never expose `ARCADE_BETA_KEY` or another server secret through a `NEXT_PUBLIC_*` variable.

## Development

```bash
yarn install
yarn dev
yarn typecheck
yarn lint
yarn build
```

## Related project

- Extension: https://github.com/ePlus-DEV/google-cloud-skills-boost-helper
- Scoring backend: https://github.com/hoangsvit/hub.eplus.dev

This is an unofficial community tool and is not affiliated with Google.
