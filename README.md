# Royals auction dashboard

Frontend for the validated Stage 3 indexes and Stage 4 shortlist. It does not recompute them.

## Refresh the data

From the workspace root, after the analytical tables exist:

```bash
python3 analysis/export/export_dashboard.py
```

That writes `dashboard/public/data/bundle.json`.

## Run

```bash
cd dashboard
npm install
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

`npm run build` typechecks with `tsc --noEmit`, then bundles.
