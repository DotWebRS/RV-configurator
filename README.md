# RV Configurator

RV configurator built with Next.js, React, and TypeScript.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

Create and run an optimized production build:

```bash
npm run build
npm start
```

## Model optimization

Place input `.glb` files in `model-optimization/input`, then run:

```bash
npm run optimize-models -- --texture-size=2048 --no-masks
```

Options:

- `--texture-size=N` sets the maximum width/height of every texture (64–16384, default `2048`). Aspect ratio is preserved and smaller textures are not enlarged.
- `--masks` or `--masks=true` enables legacy automatic ID-mask generation (default).
- `--no-masks` or `--masks=false` skips mask generation while still optimizing the model and textures.
- `--id-colors=N` selects the automatic mask palette size (1–255, default `8`) when masks are enabled.

Examples:

```bash
# Optimize to 1K and keep manually authored masks as-is.
npm run optimize-models -- --texture-size=1024 --no-masks

# Optimize to 2K and generate an automatic six-color ID mask.
npm run optimize-models -- --texture-size=2048 --masks --id-colors=6
```

Input texture names are preserved in the output GLB. Output filenames include the requested texture size, for example `model-optimized-1k.glb` or `model-optimized-1536px.glb`.

## Zoho lead submission

Copy `.env.example` to `.env.local` and add the Zoho OAuth credentials locally. Real credentials must never be committed or exposed through client-side environment variables.

Lead submission is a dry run by default. The API validates the request but does not refresh an OAuth token or contact Zoho. Live upsert requires both of these server-side values:

```env
ZOHO_LEAD_SUBMISSION_ENABLED=true
ZOHO_LIVE_CONFIRMATION=UPSERT_REAL_ZOHO_LEADS
```

Keep both values disabled until the Zoho field API names and a sandbox/test lead have been verified.
