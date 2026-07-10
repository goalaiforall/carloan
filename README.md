# Real Auto Loan Cost Calculator

A production-ready static Vite + React + TypeScript web app for Canadian car buyers to estimate the real cost of auto financing, including trade-in equity, negative equity, interest, payment frequency, and side-by-side financing scenarios.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site** → **Import an existing project**.
3. Set the build command to `npm run build`.
4. Set the publish directory to `dist`.
5. Deploy.

## Deploy to GitHub Pages

1. Install the GitHub Pages helper if desired: `npm install -D gh-pages`.
2. Add scripts such as `predeploy: npm run build` and `deploy: gh-pages -d dist`.
3. Run `npm run deploy`.

If deploying under a repository subpath, configure Vite's `base` option in `vite.config.ts`.
