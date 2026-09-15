import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { axisAtCentre, bicycleGaps, measurementRange, postGaps } from './measurements.js';

const data = JSON.parse(fs.readFileSync(new URL('./measurements.json', import.meta.url)));

test('angled bicycle spacing is measured at a shared plane, not between opposing rear wheels', () => {
  const first = { id: '01', rear: [0, 1, -1], front: [0.2, 1.2, 1] };
  const second = { id: '02', rear: [0.4, 1, 1], front: [0.2, 1.2, -1] };
  assert.deepEqual(axisAtCentre(first), [0.1, 1.1, 0]);
  assert.ok(Math.abs(bicycleGaps([second, first])[0].value - 200) < 1e-8);
});

test('all variants contain their own upright measurements and complete pair lists', () => {
  for (const [id, variant] of Object.entries(data)) {
    const capacity = id.startsWith('current') ? 13 : Number.parseInt(id);
    assert.equal(variant.axes.length, capacity);
    assert.equal(variant.posts.length, capacity);
    assert.equal(bicycleGaps(variant.axes).length, capacity - 1);
    assert.ok(bicycleGaps(variant.axes).every((gap) => gap.value > 0));
    assert.equal(measurementRange(variant.posts.map((post) => post.size[1] * 1000)), id.startsWith('current') ? '650' : '700');
    assert.ok(variant.posts.every((post) => Math.round(post.size[0] * 1000) === 30 && Math.round(post.size[2] * 1000) === 30));
  }
});

test('loaded end-post exceptions and bicycle offsets are not replaced by nominal pitch', () => {
  assert.equal(measurementRange(postGaps(data['current-bikes'].posts, 'left').map((gap) => gap.value)), '400–418');
  assert.equal(measurementRange(postGaps(data['13-bikes'].posts, 'left').map((gap) => gap.value)), '450–510');
  assert.equal(measurementRange(postGaps(data['14-bikes'].posts, 'right').map((gap) => gap.value)), '450–485');
  assert.equal(measurementRange(bicycleGaps(data['current-bikes'].axes).map((gap) => gap.value)), '180–246');
  assert.equal(measurementRange(bicycleGaps(data.current.axes).map((gap) => gap.value)), '200');
});
