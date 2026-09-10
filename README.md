# Trailer operations viewer

English 3D review of the 11, 13 and 15-position bicycle trailer studies.

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

Geometry comes from copies of the three study GLBs in `../current_version/modele_3d`. Data comes from their JSON reports and study PDF sheets. All models retain metres as their physical units, with identical camera framing for direct switching. Nominal deck dimensions can differ from actual geometry and small protrusions. Dimension guides are nominal, not a measurement tool.

Capacity means modelled bicycle positions. Bicycle clearances and permissible payload remain unvalidated. Extended chassis strength and load balance also require validation. This viewer is for internal discussion, not fabrication or operational approval.

The validated Blender model and original GLBs remain unchanged. Everything needed at runtime is served locally. No analytics or external fonts are used.

The repository includes ready-to-use web models in `public/models`; the original Blender files and study reports are not included. They are not required to run or build the viewer.

For maintainers with the original study folder, `node optimize-models.mjs` regenerates the web copies from `../current_version/modele_3d`, batching static meshes by material without removing triangles. `model-optimization.json` records the unchanged geometry bounds and the reduced draw count. Run this before rebuilding after a source model update.
