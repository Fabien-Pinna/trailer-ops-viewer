# Trailer operations viewer

English 3D review of the current bicycle trailer and the 11, 13, 14 and 15-position alternatives.

The current model has 13 positions on the original 2,550 mm nominal deck, with 200 mm rail spacing and 400 mm post spacing on the same side. It is distinct from the extended 13-position study, which uses a 3,000 mm deck and 225 / 450 mm spacing. The reference model is the default selection.

## Online viewer

Open https://Fabien-Pinna.github.io/trailer-ops-viewer/ without a GitHub account. The website, models and source repository are public.

GitHub Actions builds and deploys `main` to GitHub Pages after each push. The workflow sets the deployment base path from the Pages configuration while local development keeps relative paths.

## Run

Requires Node.js 22.12+ or 24 and npm.

```sh
npm install
npm run dev
```

Open the local address printed by Vite. For a production build, run `npm run build` and `npm run preview`. Serve `dist` through an HTTP server, not by opening its HTML as a local file. No environment variables or external services are required.

## Controls

Select a model, drag to orbit, scroll to zoom and right-drag to pan. The preset buttons provide front, rear, side, top and perspective views. Focus the 3D stage to use arrow keys, + / - and R to reset. Dimensions shows nominal loading-area dimensions. Compare layouts opens the complete dimension table. Full screen is available when the browser supports it.

## Sources and scope

Geometry comes from copies of the validated reference GLB and four study GLBs in `../current_version/modele_3d`. Data comes from their JSON reports and study PDF sheets. The current layout occupies 2,460 mm longitudinally, leaving 25 mm at each end of the 2,510 mm modelled floor. All models retain metres as their physical units, with identical camera framing for direct switching. Nominal deck dimensions can differ from actual geometry and small protrusions. Dimension guides are nominal, not a measurement tool.

Capacity means modelled bicycle positions. Bicycle clearances and permissible payload remain unvalidated. Extended chassis strength and load balance also require validation. This viewer is for internal discussion, not fabrication or operational approval.

The validated Blender model and original GLBs remain unchanged. Everything needed at runtime is served locally. No analytics or external fonts are used.

The repository includes ready-to-use web models in `public/models`; the original Blender files and study reports are not included. They are not required to run or build the viewer.

For maintainers with the original study folder, `node optimize-models.mjs` regenerates the web copies from `../current_version/modele_3d`, batching static meshes by material without removing triangles. `model-optimization.json` records the unchanged geometry bounds and the reduced draw count. Run this before rebuilding after a source model update.
