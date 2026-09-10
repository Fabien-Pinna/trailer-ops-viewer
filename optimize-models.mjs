import fs from 'node:fs/promises';
import { Box3, Group, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// GLTFExporter uses the browser FileReader API even for texture-free GLBs.
globalThis.FileReader = function () {
  this.readAsArrayBuffer = async (blob) => {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  };
};

const sources = [
  [11, 'remorque_JALON_JPLA750_etude_11_velos_225mm'],
  [13, 'remorque_etude_13_velos_plateau_3000x1600'],
  [15, 'remorque_etude_15_velos_plateau_3450x1600'],
];
const reports = [];
for (const [id, name] of sources) {
  const data = await fs.readFile(`../current_version/modele_3d/${name}.glb`);
  const { scene } = await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength), '');
  scene.updateMatrixWorld(true);
  const before = new Box3().setFromObject(scene);
  const groups = new Map();
  let triangles = 0, originalMeshes = 0;
  scene.traverse((object) => {
    if (!object.isMesh) return;
    if (object.isSkinnedMesh || Array.isArray(object.material)) throw new Error('Unsupported animated or multi-material geometry');
    originalMeshes++;
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    // No source material uses textures. Removing unused UVs allows shared batches.
    for (const attribute of Object.keys(geometry.attributes)) {
      if (!['position', 'normal'].includes(attribute)) geometry.deleteAttribute(attribute);
    }
    if (object.matrixWorld.determinant() < 0) {
      const index = geometry.index;
      for (let i = 0; i < index.count; i += 3) {
        const first = index.getX(i);
        index.setX(i, index.getX(i + 2));
        index.setX(i + 2, first);
      }
    }
    triangles += geometry.index.count / 3;
    const key = object.material.uuid;
    if (!groups.has(key)) groups.set(key, { material: object.material, geometries: [] });
    groups.get(key).geometries.push(geometry);
  });
  const output = new Group();
  for (const { material, geometries } of groups.values()) {
    const geometry = mergeGeometries(geometries);
    if (!geometry) throw new Error('Geometry batching failed');
    const mesh = new Mesh(geometry, material);
    mesh.name = material.name;
    output.add(mesh);
    for (const part of geometries) part.dispose();
  }
  const after = new Box3().setFromObject(output);
  if (before.min.distanceTo(after.min) > 0.00001 || before.max.distanceTo(after.max) > 0.00001) throw new Error('Model bounds changed');
  const finalTriangles = output.children.reduce((sum, object) => sum + object.geometry.index.count / 3, 0);
  if (finalTriangles !== triangles) throw new Error('Triangle count changed');
  const binary = await new GLTFExporter().parseAsync(output, { binary: true, onlyVisible: false });
  await fs.writeFile(`public/models/trailer-${id}.glb`, Buffer.from(binary));
  const report = { id, source: name, originalMeshes, drawCalls: output.children.length, triangles, size: after.getSize(new Vector3()).toArray(), min: after.min.toArray(), max: after.max.toArray(), bytes: binary.byteLength };
  reports.push(report);
  console.log(JSON.stringify(report));
}
await fs.writeFile('model-optimization.json', JSON.stringify(reports, null, 2));
