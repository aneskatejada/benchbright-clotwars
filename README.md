# BenchBright Learning — Clot Wars 3D Model Integration Preview

This starter project incorporates the **three files you uploaded** as actual 3D models, rendered with React, Three.js, React Three Fiber, and Drei.

## What's included

- `public/models/red_blood_cell.glb`: a red blood cell extracted from the uploaded ZIP, with downsampled textures to reduce tablet loading time.
- `public/models/platelet.glb`: the uploaded platelet mesh, unchanged.
- `public/models/blood_vessel.glb`: the uploaded anatomical blood vessel model, with compressed/downsampled textures.
- `src/ModelLibrary.jsx`: reusable model loader and animated illustrative clotting scene.
- `src/App.jsx`: browser interface to switch between normal hemostasis, Hemophilia A, and an illustrative FVIII-replacement state, plus an anatomical overview tab.
- `.github/workflows/deploy.yml`: starter GitHub Pages workflow.

## IMPORTANT scientific/technical notes

The anatomical model is not automatically a complete hollow vessel suitable for first-person navigation, so it is shown in a separate Anatomy view. The Bloodstream view uses a procedural cutaway tube, imported RBC and platelet models, a placeholder injury site, and procedural fibrin lines. The imported files contain **no embedded glTF animations**. Motion is applied through application code, not imported animation clips. The three states illustrate basic principles and are **not** a validated hemostasis simulator or medically accurate kinetics.

The RBC model has roughly 2,688 triangles. The platelet model has roughly 13,328 triangles. The anatomical vessel model contains approximately 54,082 triangles and 71 meshes. Multiple copies of platelet meshes will be GPU intensive on some mobile devices; use instancing / lower-LOD meshes for production.

**Licensing:** The original model license and any attribution requirements have NOT been verified from the file contents. Before including these assets in a commercial BenchBright Learning release, check the Fab / Sketchfab product pages, download terms, and license permissions, and keep attribution if required. Do not assume "free download" means commercial redistribution rights.

## Run locally on a computer

```bash
npm install
npm run dev
```

Then open the printed URL in a browser. To build: `npm run build`.

## Publish as a standalone GitHub Pages preview

1. Create a new GitHub repository.
2. Upload the **contents of this folder** (not the ZIP itself), including hidden `.github` folder if possible.
3. The included workflow uses `npm install`, so you do not need to create a lockfile before first deployment.
4. In GitHub Settings → Pages → Build and deployment, choose **GitHub Actions**.
5. Push or trigger the workflow, then view the deployed Pages URL provided by GitHub. On some repos GitHub Pages may need to be enabled first.

If working entirely from an Android tablet, a GitHub-connected coding agent or a repository import workflow can create these files for you without running npm on the tablet.

## Integrate models into your existing game

Copy `public/models/*.glb` into the original game's `public/models` directory. Import `NormalizedModel` and `MODEL_URLS` from `src/ModelLibrary.jsx` (or copy them into your own component). Example, inside a React Three Fiber Canvas:

```jsx
<NormalizedModel url={MODEL_URLS.erythrocyte} diameter={1.2} />
<NormalizedModel url={MODEL_URLS.platelet} diameter={0.25} />
```

If the existing project uses raw Three.js rather than React Three Fiber, load GLB directly with `GLTFLoader` from `three/addons/loaders/GLTFLoader.js`.

## Notes on the adjusted textures

To improve loading on Samsung tablets, the anatomy model's 4096px textures were reduced to 1536px, and the erythrocyte's 2048px textures to 1024px. Some embedded PNG normal maps were converted to JPEG (and texture compression may affect close-up quality). Originals from your uploads have not been changed. Replace with the originals when maximum texture fidelity is needed.
