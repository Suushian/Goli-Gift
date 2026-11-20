# Goli Gift

A small Persian RTL birthday surprise website built with React, TypeScript and Vite.

## Development

```bash
npm install
npm run dev
```

## Configure the entry passcode

For local development, create a local `.env` file (never commit it):

```env
VITE_BIRTH_YEAR=2007
```

For GitHub Pages, add a repository Actions variable named `BIRTH_YEAR` with the four-digit year:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Select **New repository variable**.
3. Name: `BIRTH_YEAR`; Value: the four-digit birthday year.
4. Save, then open **Actions** and run **Deploy to GitHub Pages** (or push to `main`).

The year is compiled into the public client-side app so this is only a playful gate, not secure authentication. Do not use it to protect private content.

## Build

```bash
npm run build
```

GitHub Pages deployment is defined in `.github/workflows/deploy.yml`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the project architecture.
