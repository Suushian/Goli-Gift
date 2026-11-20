# Goli Gift

A small Persian RTL birthday surprise website built with React, TypeScript and Vite.

## Development

```bash
npm install
npm run dev
```

## Configure the entry passcode

The default passcode is `2007` for both local and GitHub Pages builds. To
try a different passcode locally, put `VITE_BIRTH_YEAR` in an untracked
`.env.local` file. Set GitHub Pages' build source to **GitHub Actions** before
running the deployment workflow.

The year is compiled into the public client-side app so this is only a playful gate, not secure authentication. Do not use it to protect private content.

## Build

```bash
npm run build
```

GitHub Pages deployment is defined in `.github/workflows/deploy.yml`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the project architecture.

## Optional local music

If you have permission to publish the track, place the M4A at
`src/assets/memories/savage-rose.m4a` and rebuild. The memories player will
serve it from the site itself, without a SoundCloud embed. Without the M4A,
only the external listening link is offered. Local assets do not make the
hosted website available offline; that requires a local copy or offline caching.

## Birthday voice message

Add the recording as `src/assets/memories/birthday-voice.mp3` (or use the
matching `.m4a`, `.ogg`, or `.wav` extension) and rebuild. The gift button at
the end of the game opens the finale and starts the local recording when the
browser permits it. A play control is available if automatic playback fails.
