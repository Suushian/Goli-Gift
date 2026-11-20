# Goli Gift

A small Persian RTL birthday surprise website built with React, TypeScript and Vite.

## Development

```bash
npm install
npm run dev
```

## Configure the entry passcode

Set the birthday year as `VITE_BIRTH_YEAR` in a local `.env` file:

```env
VITE_BIRTH_YEAR=2000
```

The entry passcode is a playful client-side gate, not secure authentication. Do not put secrets in this value or in the public repository.

## Build

```bash
npm run build
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the project architecture.