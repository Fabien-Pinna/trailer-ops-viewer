const asset = (name) => `${import.meta.env.BASE_URL}${name}`;

/** Nominal dimensions and model measurements from the three local study reports. */
export const models = [
  { id: 11, name: 'Original footprint', deck: 2550, floor: 2510, total: 3545, rack: 2320, posts: '6 left / 5 right', extra: 0, description: '11 positions within the existing nominal trailer dimensions.' },
  { id: 13, name: 'Extended deck', deck: 3000, floor: 2960, total: 3995, rack: 2770, posts: '7 left / 6 right', extra: 450, description: 'Two more positions with a 450 mm extension to the trailer.' },
  { id: 15, name: 'Longest deck', deck: 3450, floor: 3410, total: 4445, rack: 3220, posts: '8 left / 7 right', extra: 900, description: 'Four more positions with a 900 mm extension to the trailer.' },
].map((model) => ({ ...model, url: asset(`models/trailer-${model.id}.glb`), preview: asset(`previews/trailer-${model.id}.png`) }));

/** Format dimensions consistently for an English operations audience. */
export const mm = (value) => `${value.toLocaleString('en-GB')} mm`;
