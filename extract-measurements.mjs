import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const sources = [
  ['current', 'remorque_JALON_JPLA750', 13, 200],
  ['11', 'remorque_JALON_JPLA750_etude_11_velos_225mm', 11, 225],
  ['13', 'remorque_etude_13_velos_plateau_3000x1600', 13, 225],
  ['14', 'remorque_etude_14_velos_plateau_3225x1600', 14, 225],
  ['15', 'remorque_etude_15_velos_plateau_3450x1600', 15, 225],
  ['current-bikes', 'remorque_13_velos_quinconce_v5', 13, 200, 'loading_v5'],
  ['13-bikes', 'remorque_etude_13_velos_plateau_3000x1600_velos_finaux', 13, 225, 'loading_3000'],
  ['14-bikes', 'remorque_etude_14_velos_plateau_3225x1600_velos_finaux', 14, 225, 'loading_3225'],
];
const round = (value) => Math.round(value * 1000000) / 1000000;
const output = {};
for (const [id, source, capacity, nominalPitch, loading] of sources) {
  const buffer = await fs.readFile(`../current_version/modele_3d/${source}.glb`);
  const { scene } = await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), '');
  scene.updateMatrixWorld(true);
  const posts = [];
  scene.traverse((object) => {
    if (!object.isMesh || !object.name.startsWith('GEO-Montant_')) return;
    const box = new Box3().setFromObject(object);
    const centre = box.getCenter(new Vector3());
    posts.push({
      id: object.name.replace('GEO-Montant_', '').replace(/(Gauche|Droite)_(\d{2}).*/, '$1 $2'),
      side: object.name.includes('Gauche') ? 'left' : 'right',
      centre: centre.toArray().map(round),
      size: box.getSize(new Vector3()).toArray().map(round),
    });
  });
  assert.equal(posts.length, capacity, `${id}: post count`);
  posts.sort((a, b) => a.centre[0] - b.centre[0]);
  let axes;
  if (loading) {
    const rows = JSON.parse(await fs.readFile(`../current_version/engineering/${loading}.json`, 'utf8'));
    assert.equal(rows.length, capacity, `${id}: bicycle count`);
    // Engineering reports use Blender XYZ; the viewer uses glTF X, Z, -Y.
    axes = rows.map((row) => ({
      id: row.bike.replace('BIKE-', ''),
      rear: [row.rear_axle_position_m[0], row.rear_axle_position_m[2], -row.rear_axle_position_m[1]].map(round),
      front: [row.front_axle_position_m[0], row.front_axle_position_m[2], -row.front_axle_position_m[1]].map(round),
    }));
  } else {
    axes = Array.from({ length: capacity }, (_, index) => {
      const x = round((index - (capacity - 1) / 2) * nominalPitch / 1000);
      return { id: String(index + 1).padStart(2, '0'), rear: [x, 0.7, 0.7], front: [x, 0.7, -0.7] };
    });
  }
  output[id] = { source: `${source}.glb`, loadingReport: loading ? `${loading}.json` : null, nominalPitch, posts, axes };
  console.log(`${id}: ${posts.length} posts, ${axes.length} ${loading ? 'measured bicycle axes' : 'nominal positions'}`);
}
await fs.writeFile('src/features/viewer/measurements.json', `${JSON.stringify(output, null, 2)}\n`);
