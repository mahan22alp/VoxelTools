# VoxelTools

VoxelTools is an offline Minecraft Java command toolkit built with React, TypeScript and Vite.

## What it does

- Version-aware Minecraft Java command reference
- Offline AI command agent
- English and Persian interface with RTL support
- Search and category filtering
- Copy and save commands
- Responsive Swiss-style white and purple interface
- GitHub Pages deployment

No Render service, AI provider, API key, or runtime backend is required for the production site.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview a production build

```bash
npm run preview
```

The GitHub Actions workflow builds and deploys the Vite frontend to GitHub Pages.

## Quality checks

```bash
npm test
npm run typecheck
npm run build
npm run smoke
```

The CI workflow runs tests, typechecking, the production build and a deterministic smoke test before deploying to GitHub Pages.
