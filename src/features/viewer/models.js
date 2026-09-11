const asset = (name) => `${import.meta.env.BASE_URL}${name}`;

/** Reference geometry and dimensions from the local model and study reports. */
export const models = [
  { id: 'current', capacity: 13, label: 'Current model', name: 'Reference · 200 mm spacing', deck: 2550, floor: 2510, total: 3545, rack: 2460, posts: '7 left / 6 right', extra: 0, railSpacing: 200, postSpacing: 400, endMargin: 25, description: 'The current reference model: 13 positions with 200 mm rail spacing and 400 mm between posts on the same side.' },
  { id: 11, name: 'Original footprint', deck: 2550, floor: 2510, total: 3545, rack: 2320, posts: '6 left / 5 right', extra: 0, description: '11 positions within the existing nominal trailer dimensions.' },
  { id: 13, name: 'Extended deck', deck: 3000, floor: 2960, total: 3995, rack: 2770, posts: '7 left / 6 right', extra: 450, description: 'Two more positions with a 450 mm extension to the trailer.' },
  { id: 14, name: 'Balanced rows', deck: 3225, floor: 3185, total: 4220, rack: 2995, posts: '7 left / 7 right', extra: 675, description: '14 positions with seven posts on each side and a 675 mm extension to the trailer.' },
  { id: 15, name: 'Longest deck', deck: 3450, floor: 3410, total: 4445, rack: 3220, posts: '8 left / 7 right', extra: 900, description: 'Four more positions with a 900 mm extension to the trailer.' },
].map((model) => ({ capacity: model.id, label: `${model.id} positions`, railSpacing: 225, postSpacing: 450, endMargin: 95, ...model, url: asset(`models/trailer-${model.id}.glb`), preview: asset(`previews/trailer-${model.id}.png`) }));

/** Format dimensions consistently for an English operations audience. */
export const mm = (value) => `${value.toLocaleString('en-GB')} mm`;
