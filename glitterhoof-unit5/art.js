const COATS = {
  cream:  { n: 'Vanilla',      c: ['#fff3ea', '#f6d8cc', '#ffe3dc'], price: 0,  rar: 'common' },
  lilac:  { n: 'Lilac',        c: ['#eadbff', '#cdb5f6', '#f5ecff'], price: 0,  rar: 'common' },
  pink:   { n: 'Bubblegum',    c: ['#ffd3e8', '#f6a9cc', '#ffe8f3'], price: 12, rar: 'common' },
  mint:   { n: 'Mint',         c: ['#d3f6e8', '#a1dcc6', '#e9fbf4'], price: 12, rar: 'common' },
  sky:    { n: 'Cloud Blue',   c: ['#d3ebff', '#9ecbf2', '#eaf6ff'], price: 12, rar: 'common' },
  peach:  { n: 'Peach Fizz',   c: ['#ffe3c8', '#f6bf93', '#fff1e3'], price: 12, rar: 'common' },
  snow:   { n: 'Snowflake',    c: ['#ffffff', '#ddd6ee', '#f8f4ff'], price: 30, rar: 'rare' },
  galaxy: { n: 'Galaxy',       c: ['#7a5bd0', '#4d3694', '#9a80e4'], price: 70, rar: 'epic', stars: true }
};
const MANES = {
  pinkberry: { n: 'Pink Berry',   s: ['#ff8cc4', '#ff4fa0'], price: 0,  rar: 'common' },
  grape:     { n: 'Grape Fizz',   s: ['#c7a1ff', '#8f5cf2'], price: 10, rar: 'common' },
  blueberry: { n: 'Blueberry',    s: ['#8fc0ff', '#5a8cf0'], price: 10, rar: 'common' },
  minty:     { n: 'Minty Fresh',  s: ['#8ff0d2', '#3fc9a0'], price: 10, rar: 'common' },
  sunshine:  { n: 'Sunshine',     s: ['#ffe27a', '#ffb21f'], price: 10, rar: 'common' },
  cotton:    { n: 'Cotton Candy', s: ['#ffb3de', '#9fd8ff'], price: 28, rar: 'rare' },
  midnight:  { n: 'Midnight',     s: ['#7a68d0', '#34286e'], price: 28, rar: 'rare' },
  sunset:    { n: 'Sunset',       s: ['#ffb27a', '#ff5fa8', '#a97bff'], price: 45, rar: 'epic' },
  rainbow:   { n: 'Rainbow',      s: ['#ff6b9a', '#ffc94a', '#6fe3b8', '#63c5ff', '#a97bff'], price: 90, rar: 'legendary' }
};
const STYLES = {
  flow:     { n: 'Flowy',      price: 0,  rar: 'common' },
  puff:     { n: 'Cloud Puffs', price: 12, rar: 'common' },
  pigtails: { n: 'Pigtails',   price: 18, rar: 'common' },
  bob:      { n: 'Bouncy Bob', price: 18, rar: 'common' },
  curls:    { n: 'Curly Q',    price: 30, rar: 'rare' }
};
const HORNS = {
  gold:    { n: 'Golden',        price: 0,  rar: 'common' },
  pearl:   { n: 'Pearl',         price: 14, rar: 'common' },
  candy:   { n: 'Candy Cane',    price: 20, rar: 'common' },
  crystal: { n: 'Crystal',       price: 35, rar: 'rare' },
  starry:  { n: 'Starlight',     price: 55, rar: 'epic' },
  rainbow: { n: 'Rainbow Swirl', price: 80, rar: 'legendary' }
};
const WINGS = {
  none:      { n: 'No Wings',  price: 0,  rar: 'common' },
  fairy:     { n: 'Fairy',     price: 30, rar: 'rare' },
  feather:   { n: 'Feather',   price: 30, rar: 'rare' },
  butterfly: { n: 'Butterfly', price: 45, rar: 'epic' },
  rainbow:   { n: 'Rainbow',   price: 85, rar: 'legendary' }
};
const HEADS = {
  none:      { n: 'Nothing',      price: 0,  rar: 'common' },
  bow:       { n: 'Big Bow',      price: 12, rar: 'common' },
  starclips: { n: 'Star Clips',   price: 14, rar: 'common' },
  flowers:   { n: 'Flower Crown', price: 24, rar: 'rare' },
  partyhat:  { n: 'Party Hat',    price: 20, rar: 'common' },
  tiara:     { n: 'Tiara',        price: 40, rar: 'rare' },
  halo:      { n: 'Golden Halo',  price: 50, rar: 'epic' },
  crown:     { n: 'Royal Crown',  price: 75, rar: 'legendary' }
};
const FACES = {
  none:        { n: 'Nothing',       price: 0,  rar: 'common' },
  cheekstars:  { n: 'Cheek Stars',   price: 10, rar: 'common' },
  freckles:    { n: 'Freckles',      price: 10, rar: 'common' },
  facegems:    { n: 'Face Gems',     price: 22, rar: 'rare' },
  roundglasses:{ n: 'Round Glasses', price: 18, rar: 'common' },
  heartglasses:{ n: 'Heart Glasses', price: 30, rar: 'rare' },
  starglasses: { n: 'Star Glasses',  price: 30, rar: 'rare' }
};
const NECKS = {
  none:   { n: 'Nothing',      price: 0,  rar: 'common' },
  heart:  { n: 'Heart Charm',  price: 16, rar: 'common' },
  pearls: { n: 'Pearl String', price: 24, rar: 'rare' },
  star:   { n: 'Star Charm',   price: 24, rar: 'rare' },
  scarf:  { n: 'Rainbow Scarf', price: 36, rar: 'rare' }
};
const CAPES = {
  none:       { n: 'No Cape',      price: 0,  rar: 'common' },
  rosepetal:  { n: 'Rose Petal',   price: 22, rar: 'common' },
  royal:      { n: 'Royal Velvet', price: 35, rar: 'rare' },
  starry:     { n: 'Starry Night', price: 55, rar: 'epic' },
  rainbowcape:{ n: 'Rainbow Cape', price: 80, rar: 'legendary' }
};
const SCENES = {
  blush:   { n: 'Blush Sky',     price: 0,  rar: 'common' },
  meadow:  { n: 'Flower Meadow', price: 18, rar: 'common' },
  candy:   { n: 'Candy Clouds',  price: 26, rar: 'rare' },
  rainbow: { n: 'Rainbow Sky',   price: 34, rar: 'rare' },
  castle:  { n: 'Pink Castle',   price: 50, rar: 'epic' },
  night:   { n: 'Moonlit Night', price: 50, rar: 'epic' }
};
const CATS = [
  { id: 'coat',  name: 'Coat',   icon: '🦄', set: COATS,  view: '40 -24 220 330' },
  { id: 'mane',  name: 'Mane',   icon: '💖', set: MANES,  view: '10 -24 280 330' },
  { id: 'style', name: 'Style',  icon: '🎀', set: STYLES, view: '10 -24 280 330' },
  { id: 'horn',  name: 'Horn',   icon: '✨', set: HORNS,  view: '105 -24 90 150' },
  { id: 'wings', name: 'Wings',  icon: '🦋', set: WINGS,  view: '0 60 300 220' },
  { id: 'head',  name: 'Head',   icon: '👑', set: HEADS,  view: '60 -24 180 150' },
  { id: 'face',  name: 'Face',   icon: '🕶️', set: FACES,  view: '70 110 160 110' },
  { id: 'neck',  name: 'Neck',   icon: '📿', set: NECKS,  view: '70 190 160 120' },
  { id: 'cape',  name: 'Cape',   icon: '🧣', set: CAPES,  view: '30 180 240 130' },
  { id: 'scene', name: 'Scene',  icon: '🏰', set: SCENES, view: null }
];
const catOf = id => CATS.find(c => c.id === id);
const RAR = { common: { n: 'Common', c: '#b79ddc' }, rare: { n: 'Rare', c: '#4fb6f2' }, epic: { n: 'Epic', c: '#a266ff' }, legendary: { n: 'Legendary', c: '#ffb700' } };
const itemKey = (cat, id) => cat + ':' + id;
const ALL_ITEMS = [];
CATS.forEach(c => Object.keys(c.set).forEach(id => ALL_ITEMS.push(Object.assign({ cat: c.id, id, key: itemKey(c.id, id) }, c.set[id]))));
const isOwned = (cat, id) => (catOf(cat).set[id].price === 0) || !!S.owned[itemKey(cat, id)];

/* ---------- drawing ---------- */
let UID = 0;
const mir = inner => inner + '<g transform="translate(300 0) scale(-1 1)">' + inner + '</g>';
const grad = (id, stops, dir = 'v') => `<linearGradient id="${id}" ${dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"'}>${stops.map((c, i) => `<stop offset="${stops.length === 1 ? 0 : Math.round(100 * i / (stops.length - 1))}%" stop-color="${c}"/>`).join('')}</linearGradient>`;
const RB = ['#ff6b9a', '#ffc94a', '#6fe3b8', '#63c5ff', '#a97bff'];
const heartD = (x, y, s) => `M${x} ${y + 10 * s} C ${x - 26 * s} ${y - 8 * s} ${x - 14 * s} ${y - 26 * s} ${x} ${y - 13 * s} C ${x + 14 * s} ${y - 26 * s} ${x + 26 * s} ${y - 8 * s} ${x} ${y + 10 * s} Z`;
const starD = (x, y, r, k = 5, inner = .45) => { let d = ''; for (let i = 0; i < k * 2; i++) { const rr = i % 2 ? r * inner : r, a = Math.PI * i / k - Math.PI / 2; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return d + 'Z'; };
const sp4 = (x, y, r) => `<path d="${starD(x, y, r, 4, .3)}" fill="#fff"/>`;

function uni(look, o = {}) {
  const L = Object.assign({}, S.uni.look, look || {});
  const mood = o.mood || 'happy', u = 'u' + (++UID);
  const coat = COATS[L.coat] || COATS.cream, mane = MANES[L.mane] || MANES.pinkberry, ink = '#3b1f5e';
  const cg = `url(#${u}c)`, mg = `url(#${u}m)`;
  let defs = grad(u + 'c', [coat.c[0], coat.c[0], coat.c[1]]) + grad(u + 'm', mane.s) + grad(u + 'rb', RB) + grad(u + 'rbh', RB, 'h');
  defs += `<radialGradient id="${u}i" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#b57cff"/><stop offset="1" stop-color="#6a3fc4"/></radialGradient>`;
  defs += `<clipPath id="${u}hc"><path d="M139 98 L150 14 L161 98 Z"/></clipPath>`;

  /* wings */
  const leaf = 'M114 238 C 78 240 34 210 20 160 C 16 142 30 130 44 142 C 40 118 56 104 70 118 C 74 100 94 100 98 118 C 108 152 116 198 120 232 Z';
  let wings = '';
  if (L.wings === 'fairy') wings = mir(`<path d="${leaf}" fill="rgba(160,225,255,.62)" stroke="#86cbee" stroke-width="2.5"/><path d="M112 232 C 90 200 60 170 32 150 M112 232 C 100 190 84 150 70 120 M112 232 C 100 205 80 190 50 176" stroke="#b8ecff" stroke-width="2" fill="none"/>`);
  else if (L.wings === 'feather') wings = mir(`<path d="${leaf}" fill="#fff" stroke="#e4d9f6" stroke-width="2.5"/><path d="M112 232 C 90 200 60 170 32 152 M112 232 C 100 190 86 152 72 124" stroke="#eadff8" stroke-width="2.5" fill="none"/><path d="M26 162 q8 6 6 14 M44 150 q8 6 5 14 M72 126 q8 4 6 14" stroke="#efe6fa" stroke-width="2" fill="none"/>`);
  else if (L.wings === 'butterfly') wings = mir(`<ellipse cx="66" cy="150" rx="56" ry="44" transform="rotate(-28 66 150)" fill="url(#${u}bf)"/><ellipse cx="88" cy="224" rx="40" ry="28" transform="rotate(22 88 224)" fill="url(#${u}bf)"/><circle cx="52" cy="140" r="9" fill="#fff" opacity=".8"/><circle cx="84" cy="164" r="6" fill="#fff" opacity=".7"/><circle cx="78" cy="226" r="6" fill="#fff" opacity=".8"/>`);
  else if (L.wings === 'rainbow') wings = mir(`<path d="${leaf}" fill="url(#${u}rb)" stroke="#fff" stroke-width="2.5" opacity=".95"/>`);
  if (L.wings === 'butterfly') defs += grad(u + 'bf', ['#ff9ad0', '#b57cff'], 'h');

  /* cape (behind the chest) */
  let cape = '';
  const capeD = 'M92 214 C 54 244 40 284 46 306 L 254 306 C 260 284 246 244 208 214 Z';
  if (L.cape === 'royal') { defs += grad(u + 'cp', ['#9a68ff', '#5b34c7']); cape = `<path d="${capeD}" fill="url(#${u}cp)"/><path d="M46 296 L254 296" stroke="#ffd45a" stroke-width="8"/>`; }
  else if (L.cape === 'rosepetal') { defs += grad(u + 'cp', ['#ff9ccb', '#e83e8c']); cape = `<path d="${capeD}" fill="url(#${u}cp)"/><circle cx="90" cy="278" r="6" fill="#fff" opacity=".5"/><circle cx="210" cy="270" r="5" fill="#fff" opacity=".5"/>`; }
  else if (L.cape === 'starry') { defs += grad(u + 'cp', ['#4a3a9a', '#241a5c']); cape = `<path d="${capeD}" fill="url(#${u}cp)"/><path d="${starD(80, 270, 7, 4, .35)}" fill="#ffe27a"/><path d="${starD(224, 262, 6, 4, .35)}" fill="#ffe27a"/><path d="${starD(150, 292, 7, 4, .35)}" fill="#fff"/>`; }
  else if (L.cape === 'rainbowcape') cape = `<path d="${capeD}" fill="url(#${u}rb)"/>`;

  /* back of mane */
  const M = L.style;
  let manes = '';
  if (M === 'flow') manes = mir(`<path d="M96 100 C 40 108 26 190 50 252 C 60 282 82 262 76 238 C 70 208 94 190 104 158 Z" fill="${mg}"/><path d="M80 130 C 62 160 60 200 70 228" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  else if (M === 'puff') manes = mir(`<circle cx="76" cy="124" r="30" fill="${mg}"/><circle cx="62" cy="166" r="28" fill="${mg}"/><circle cx="76" cy="206" r="26" fill="${mg}"/><circle cx="96" cy="98" r="24" fill="${mg}"/><circle cx="68" cy="116" r="8" fill="#fff" opacity=".28"/>`);
  else if (M === 'pigtails') manes = mir(`<path d="M80 100 C 40 120 28 190 44 256 C 70 238 82 180 98 136 Z" fill="${mg}"/><circle cx="76" cy="98" r="18" fill="${mg}"/><path d="M60 126 C 52 170 54 210 60 238" stroke="#fff" stroke-opacity=".32" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  else if (M === 'bob') manes = mir(`<path d="M94 98 C 56 110 50 176 74 216 C 90 226 104 210 104 180 Z" fill="${mg}"/><path d="M76 132 C 66 154 68 180 78 198" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  else if (M === 'curls') manes = mir(`<circle cx="74" cy="126" r="24" fill="${mg}"/><circle cx="56" cy="160" r="22" fill="${mg}"/><circle cx="70" cy="194" r="21" fill="${mg}"/><circle cx="56" cy="226" r="19" fill="${mg}"/><circle cx="94" cy="104" r="20" fill="${mg}"/><path d="M74 118 q10 -4 10 6 q-2 10 -12 6 M56 152 q10 -4 10 6 q-2 10 -12 6 M70 186 q10 -4 10 6 q-2 10 -12 6" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>`);
  let pigBows = '';
  if (M === 'pigtails') pigBows = mir(`<g transform="translate(76 98)"><path d="M0 0 L-17 -11 L-17 11 Z M0 0 L17 -11 L17 11 Z" fill="#fff"/><circle r="5" fill="#ff5fa8"/></g>`);

  /* ears */
  const ears = mir(`<path d="M98 108 C 80 84 82 52 92 36 C 112 48 128 74 132 100 Z" fill="${cg}"/><path d="M99 96 C 90 78 90 60 94 49 C 106 58 116 76 119 94 Z" fill="#ffb9d8"/>`);

  /* chest */
  const chest = `<path d="M82 306 C 78 252 108 216 150 216 C 192 216 222 252 218 306 Z" fill="${cg}"/><path d="M110 240 q40 28 80 0" stroke="${coat.c[1]}" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;

  /* head */
  const headD = 'M150 84 C 206 84 226 124 222 158 C 218 192 188 216 150 216 C 112 216 82 192 78 158 C 74 124 94 84 150 84 Z';
  let head = `<path d="${headD}" fill="${cg}"/>`;
  if (coat.stars) head += [[110, 130], [190, 118], [176, 176], [100, 180], [150, 108]].map(p => `<path d="${starD(p[0], p[1], 5, 4, .3)}" fill="#fff" opacity=".7"/>`).join('');
  head += `<ellipse cx="150" cy="192" rx="34" ry="23" fill="${coat.c[2]}"/><ellipse cx="139" cy="190" rx="2.8" ry="3.6" fill="${coat.c[1]}"/><ellipse cx="161" cy="190" rx="2.8" ry="3.6" fill="${coat.c[1]}"/>`;
  head += `<ellipse cx="100" cy="184" rx="14" ry="8.5" fill="#ff8fbf" opacity=".5"/><ellipse cx="200" cy="184" rx="14" ry="8.5" fill="#ff8fbf" opacity=".5"/>`;

  /* eyes + mouth by mood */
  const eye = cx => `<ellipse cx="${cx}" cy="160" rx="14" ry="18" fill="${ink}"/><ellipse cx="${cx}" cy="163" rx="10" ry="12.5" fill="url(#${u}i)"/><circle cx="${cx + 4}" cy="153" r="5.6" fill="#fff"/><circle cx="${cx - 5}" cy="169" r="2.6" fill="#fff" opacity=".9"/><path d="M${cx - 13} ${150} q-7 -3 -10 -11 M${cx - 8} ${144} q-4 -5 -4 -12" stroke="${ink}" stroke-width="3" stroke-linecap="round" fill="none" transform="${cx > 150 ? `translate(${2 * cx - 0} 0) scale(-1 1)` : ''}"/>`;
  let eyes = '', mouth = '';
  const smile = `<path d="M138 201 Q150 211 162 201" stroke="${ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  if (mood === 'cheer') {
    eyes = [118, 182].map(cx => `<path d="M${cx - 14} 166 Q${cx} 144 ${cx + 14} 166" stroke="${ink}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`).join('');
    mouth = `<path d="M134 198 Q150 226 166 198 Z" fill="#d9457f" stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"/><path d="M142 210 Q150 218 158 210 Q150 205 142 210 Z" fill="#ff9ab8"/>`;
  } else if (mood === 'sleep') {
    eyes = [118, 182].map(cx => `<path d="M${cx - 14} 160 Q${cx} 174 ${cx + 14} 160" stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join('');
    mouth = `<path d="M142 202 Q150 206 158 202" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else if (mood === 'oops') {
    eyes = `<g class="blink">${eye(118)}${eye(182)}</g><path d="M101 143 Q116 137 131 128 M169 128 Q184 137 199 143" stroke="${ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
    mouth = `<path d="M139 205 Q150 197 161 205" stroke="${ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  } else if (mood === 'think') {
    eyes = `<g class="blink">${eye(118)}${eye(182)}</g>`;
    mouth = `<ellipse cx="150" cy="203" rx="5" ry="6" fill="#d9457f" stroke="${ink}" stroke-width="2.4"/>`;
  } else { eyes = `<g class="blink">${eye(118)}${eye(182)}</g>`; mouth = smile; }

  /* face accessories */
  let face = '';
  if (L.face === 'cheekstars') face = [[98, 190], [202, 190]].map(p => `<path d="${starD(p[0], p[1], 9, 5, .45)}" fill="#ffd54a" stroke="#fff" stroke-width="1.5"/>`).join('');
  else if (L.face === 'freckles') face = [[92, 178], [101, 186], [110, 178], [190, 178], [199, 186], [208, 178]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.2" fill="#d98a6a" opacity=".7"/>`).join('');
  else if (L.face === 'facegems') face = [[88, 150, '#63c5ff'], [212, 150, '#ff6b9a'], [96, 140, '#a97bff'], [204, 140, '#6fe3b8']].map(p => `<path d="M${p[0]} ${p[1] - 6} l6 6 l-6 6 l-6 -6 Z" fill="${p[2]}" stroke="#fff" stroke-width="1.4"/>`).join('');
  else if (L.face === 'roundglasses') face = `<g fill="rgba(255,255,255,.22)" stroke="#7a4fd1" stroke-width="5"><circle cx="118" cy="161" r="25"/><circle cx="182" cy="161" r="25"/></g><path d="M143 158 Q150 152 157 158" stroke="#7a4fd1" stroke-width="5" fill="none"/>`;
  else if (L.face === 'heartglasses') face = `<g fill="rgba(255,150,200,.4)" stroke="#e83e8c" stroke-width="4.5" stroke-linejoin="round"><path d="${heartD(118, 160, 1.5)}"/><path d="${heartD(182, 160, 1.5)}"/></g><path d="M143 156 Q150 150 157 156" stroke="#e83e8c" stroke-width="4.5" fill="none"/>`;
  else if (L.face === 'starglasses') face = `<g fill="rgba(255,230,120,.5)" stroke="#f0a400" stroke-width="4.5" stroke-linejoin="round"><path d="${starD(118, 162, 29, 5, .5)}"/><path d="${starD(182, 162, 29, 5, .5)}"/></g><path d="M145 158 Q150 153 155 158" stroke="#f0a400" stroke-width="4.5" fill="none"/>`;

  /* fringe in front */
  let fringe = '';
  if (M === 'flow') fringe = `<path d="M82 128 C 84 90 128 76 158 84 C 192 92 220 110 218 140 C 204 112 176 106 152 114 C 128 122 112 140 104 162 C 92 154 84 142 82 128 Z" fill="${mg}"/><path d="M120 100 C 140 92 170 96 188 108" stroke="#fff" stroke-opacity=".4" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if (M === 'puff') fringe = `<circle cx="104" cy="112" r="21" fill="${mg}"/><circle cx="196" cy="112" r="21" fill="${mg}"/><circle cx="128" cy="98" r="19" fill="${mg}"/><circle cx="172" cy="98" r="19" fill="${mg}"/><circle cx="98" cy="106" r="6" fill="#fff" opacity=".3"/>`;
  else if (M === 'pigtails') fringe = `<path d="M84 130 C 88 92 126 78 150 82 C 176 78 212 94 216 130 C 200 112 182 108 166 116 C 150 106 134 106 120 116 C 106 108 92 114 84 130 Z" fill="${mg}"/>`;
  else if (M === 'bob') fringe = `<path d="M82 134 C 84 92 126 76 150 80 C 176 76 218 92 218 134 C 206 110 180 104 150 112 C 120 104 94 110 82 134 Z" fill="${mg}"/>`;
  else if (M === 'curls') fringe = `<circle cx="108" cy="110" r="17" fill="${mg}"/><circle cx="132" cy="98" r="15" fill="${mg}"/><circle cx="168" cy="98" r="15" fill="${mg}"/><circle cx="192" cy="110" r="17" fill="${mg}"/><path d="M108 104 q9 -3 9 6 q-2 8 -11 5 M192 104 q9 -3 9 6 q-2 8 -11 5" stroke="#fff" stroke-opacity=".5" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;

  /* head accessories (behind the horn) */
  let hat = '';
  if (L.head === 'tiara') hat = `<path d="M114 100 L120 80 L132 94 L150 72 L168 94 L180 80 L186 100 Z" fill="#ffd45a" stroke="#f0a400" stroke-width="2.5" stroke-linejoin="round"/><circle cx="150" cy="82" r="5" fill="#ff5fa8"/><circle cx="125" cy="90" r="3.5" fill="#63c5ff"/><circle cx="175" cy="90" r="3.5" fill="#63c5ff"/>`;
  else if (L.head === 'crown') hat = `<path d="M104 104 L106 62 L128 84 L150 52 L172 84 L194 62 L196 104 Z" fill="#ffd45a" stroke="#f0a400" stroke-width="3" stroke-linejoin="round"/><rect x="104" y="96" width="92" height="10" rx="3" fill="#f0a400"/><circle cx="150" cy="68" r="6" fill="#ff5fa8"/><circle cx="108" cy="66" r="4.5" fill="#63c5ff"/><circle cx="192" cy="66" r="4.5" fill="#63c5ff"/><circle cx="128" cy="100" r="3.5" fill="#6fe3b8"/><circle cx="172" cy="100" r="3.5" fill="#6fe3b8"/>`;
  else if (L.head === 'flowers') hat = [[98, 112, '#ff8cc4'], [112, 94, '#ffd45a'], [132, 84, '#fff'], [168, 84, '#ff8cc4'], [188, 94, '#fff'], [202, 112, '#ffd45a']].map(f => `<g transform="translate(${f[0]} ${f[1]})">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 7).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 7).toFixed(1)}" r="5.6" fill="${f[2]}" stroke="#fff" stroke-width="1" stroke-opacity=".6"/>`).join('')}<circle r="4" fill="${f[2] === '#ffd45a' ? '#ff8cc4' : '#ffd45a'}"/></g>`).join('');
  else if (L.head === 'bow') hat = `<g transform="translate(196 98) rotate(14)"><path d="M0 0 L-26 -17 Q-34 0 -26 17 Z M0 0 L26 -17 Q34 0 26 17 Z" fill="#ff5fa8" stroke="#d93a86" stroke-width="2.5" stroke-linejoin="round"/><circle r="7" fill="#ff8cc4" stroke="#d93a86" stroke-width="2.5"/><circle cx="-17" cy="-3" r="2.4" fill="#fff"/><circle cx="17" cy="3" r="2.4" fill="#fff"/></g>`;
  else if (L.head === 'starclips') hat = `<path d="${starD(196, 118, 13, 5, .45)}" fill="#ffd54a" stroke="#f0a400" stroke-width="2" stroke-linejoin="round"/><path d="${starD(212, 140, 9, 5, .45)}" fill="#ff8cc4" stroke="#d93a86" stroke-width="2" stroke-linejoin="round"/>`;
  else if (L.head === 'partyhat') hat = `<g transform="translate(112 96) rotate(-22)"><path d="M-22 0 L0 -64 L22 0 Z" fill="#7fd6ff" stroke="#3aa8e0" stroke-width="2.5" stroke-linejoin="round"/><path d="M-14 -22 L14 -22 M-8 -42 L8 -42" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cy="-66" r="8" fill="#ff5fa8"/></g>`;
  else if (L.head === 'halo') hat = `<ellipse cx="150" cy="4" rx="40" ry="9" fill="none" stroke="#ffd45a" stroke-width="7"/><ellipse cx="150" cy="4" rx="40" ry="9" fill="none" stroke="#fff6c7" stroke-width="2.4" opacity=".8"/>`;

  /* horn */
  let horn = '';
  const HD = 'M139 98 L150 14 L161 98 Z';
  if (L.horn === 'gold') { defs += grad(u + 'hg', ['#fff0a8', '#ffc83a', '#f0a000']); horn = `<path d="${HD}" fill="url(#${u}hg)"/><g clip-path="url(#${u}hc)" stroke="#fff" stroke-opacity=".6" stroke-width="4.5"><path d="M130 90 L170 78 M130 72 L170 60 M130 54 L170 42 M130 36 L170 24"/></g>`; }
  else if (L.horn === 'pearl') { defs += grad(u + 'hg', ['#ffffff', '#ffd8ec', '#f6a9cc']); horn = `<path d="${HD}" fill="url(#${u}hg)"/><g clip-path="url(#${u}hc)" stroke="#fff" stroke-opacity=".8" stroke-width="4"><path d="M130 90 L170 78 M130 72 L170 60 M130 54 L170 42 M130 36 L170 24"/></g>`; }
  else if (L.horn === 'candy') horn = `<path d="${HD}" fill="#fff"/><g clip-path="url(#${u}hc)" stroke="#ff4f8b" stroke-width="7"><path d="M130 96 L170 82 M130 76 L170 62 M130 56 L170 42 M130 36 L170 22"/></g><path d="${HD}" fill="none" stroke="#ffd0e4" stroke-width="1.5"/>`;
  else if (L.horn === 'crystal') { defs += grad(u + 'hg', ['#e8fbff', '#9fe6ff', '#5cc8ff']); horn = `<path d="${HD}" fill="url(#${u}hg)"/><path d="M150 14 L150 98 M150 14 L141 70 M150 14 L159 70" stroke="#fff" stroke-opacity=".8" stroke-width="2" fill="none"/><path d="M146 40 L148 28" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`; }
  else if (L.horn === 'starry') { defs += grad(u + 'hg', ['#fff0a8', '#ffc83a', '#f0a000']); horn = `<path d="${HD}" fill="url(#${u}hg)"/><g clip-path="url(#${u}hc)" stroke="#fff" stroke-opacity=".6" stroke-width="4.5"><path d="M130 90 L170 78 M130 72 L170 60 M130 54 L170 42 M130 36 L170 24"/></g><path d="${starD(150, 8, 15, 5, .45)}" fill="#fff6a8" stroke="#f0a400" stroke-width="2.5" stroke-linejoin="round"/>`; }
  else if (L.horn === 'rainbow') horn = `<path d="${HD}" fill="url(#${u}rb)"/><g clip-path="url(#${u}hc)" stroke="#fff" stroke-opacity=".55" stroke-width="4.5"><path d="M130 90 L170 78 M130 72 L170 60 M130 54 L170 42 M130 36 L170 24"/></g>`;
  const tuft = `<path d="M150 100 C 128 98 126 84 140 84 C 146 84 150 88 150 92 C 150 88 154 84 160 84 C 174 84 172 98 150 100 Z" fill="${mg}"/>`;

  /* neck items */
  let neck = '';
  if (L.neck === 'heart') neck = `<path d="M106 220 Q150 250 194 220" stroke="#ffd45a" stroke-width="3.5" fill="none"/><path d="${heartD(150, 246, 1)}" fill="#ff5fa8" stroke="#d93a86" stroke-width="2.4" stroke-linejoin="round"/>`;
  else if (L.neck === 'star') neck = `<path d="M106 220 Q150 250 194 220" stroke="#ffd45a" stroke-width="3.5" fill="none"/><path d="${starD(150, 248, 15, 5, .45)}" fill="#ffd54a" stroke="#f0a400" stroke-width="2.4" stroke-linejoin="round"/>`;
  else if (L.neck === 'pearls') neck = Array.from({ length: 9 }, (_, i) => { const t = i / 8, x = 104 + 92 * t, y = 220 + Math.sin(t * Math.PI) * 24; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="#fff" stroke="#e6d8f2" stroke-width="1.6"/>`; }).join('');
  else if (L.neck === 'scarf') neck = `<path d="M96 218 Q150 248 204 218 L206 236 Q150 266 94 236 Z" fill="url(#${u}rbh)"/><path d="M176 244 L190 290 L206 284 L194 240 Z" fill="#ff8cc4"/>`;

  const sparks = o.sparkle === false ? '' : `<g class="twk">${sp4(34, 40, 9)}${sp4(268, 70, 7)}${sp4(262, 214, 8)}${sp4(40, 252, 6)}</g>`;
  const view = o.view || '0 -24 300 330';
  return `<svg class="uni ${o.cls || ''}" viewBox="${view}" role="img" aria-label="${esc(S.uni.name)} the unicorn" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${wings}${cape}${manes}${ears}${chest}${neck}${head}${face}${eyes}${mouth}${fringe}${pigBows}${hat}${horn}${tuft}${sparks}</svg>`;
}
function uniHead(look) { return uni(look, { view: '56 -10 188 232', sparkle: false, cls: 'headonly' }); }

/* thumbnail of one item, worn on the current unicorn */
function itemThumb(cat, id) {
  const c = catOf(cat);
  if (cat === 'scene') return `<div class="thumbscene">${sceneSVG(id)}</div>`;
  const look = Object.assign({}, S.uni.look, { [cat]: id });
  if (cat === 'coat' || cat === 'mane' || cat === 'style') return uni(look, { view: c.view, sparkle: false });
  return uni(look, { view: c.view, sparkle: false });
}

/* ---------- scenes ---------- */
const cloud = (x, y, s = 1, o = .92) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}" fill="#fff"><ellipse cx="0" cy="0" rx="46" ry="20"/><ellipse cx="-24" cy="-12" rx="26" ry="20"/><ellipse cx="14" cy="-18" rx="30" ry="24"/></g>`;
function sceneSVG(id) {
  const u = 's' + (++UID);
  const W = 800, Hh = 500;
  let defs = '', body = '';
  const twinkles = (n, seed, col = '#fff') => Array.from({ length: n }, (_, i) => { const x = (i * 197 + seed * 53) % W, y = (i * 89 + seed * 31) % 300; return `<path class="tw${i % 3}" d="${starD(x, y, 5 + (i % 3) * 2, 4, .3)}" fill="${col}" opacity=".85"/>`; }).join('');
  if (id === 'rainbow') {
    defs = grad(u, ['#aee4ff', '#ffe2f3']);
    const arcs = ['#ff6b9a', '#ffa86b', '#ffe066', '#7fe3b8', '#63c5ff', '#a97bff'].map((c, i) => `<path d="M${90 + i * 16} 470 A ${310 - i * 16} ${310 - i * 16} 0 0 1 ${710 - i * 16} 470" stroke="${c}" stroke-width="17" fill="none" opacity=".92"/>`).join('');
    body = `<rect width="${W}" height="${Hh}" fill="url(#${u})"/>${arcs}${cloud(110, 440, 1.6)}${cloud(690, 450, 1.6)}${cloud(380, 90, .9, .8)}${cloud(620, 140, .7, .7)}${twinkles(8, 2)}`;
  } else if (id === 'castle') {
    defs = grad(u, ['#d9c8ff', '#ffd6ec', '#fff0e6']);
    const tower = (x, w, hgt, c) => `<rect x="${x}" y="${470 - hgt}" width="${w}" height="${hgt}" fill="${c}"/><path d="M${x - 8} ${470 - hgt} L${x + w / 2} ${470 - hgt - w * .9} L${x + w + 8} ${470 - hgt} Z" fill="#ff7ab8"/><rect x="${x + w / 2 - 6}" y="${470 - hgt + 26}" width="12" height="22" rx="6" fill="#8a6fd6"/>`;
    body = `<rect width="${W}" height="${Hh}" fill="url(#${u})"/>${cloud(120, 110, 1)}${cloud(660, 90, 1.1)}<g opacity=".95">${tower(540, 62, 180, '#ffe6f2')}${tower(610, 52, 130, '#ffd9ec')}${tower(660, 70, 220, '#fff0f7')}${tower(740, 50, 150, '#ffe0f0')}</g><ellipse cx="400" cy="520" rx="520" ry="110" fill="#bfe8c9"/>${twinkles(9, 5)}`;
  } else if (id === 'candy') {
    defs = grad(u, ['#c9f3ea', '#ffd9ee', '#fff1c9']);
    const lolli = (x, y, c) => `<rect x="${x - 3}" y="${y}" width="6" height="90" rx="3" fill="#fff"/><circle cx="${x}" cy="${y}" r="26" fill="${c}"/><path d="M${x} ${y} m-14 0 a14 14 0 1 1 14 14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    body = `<rect width="${W}" height="${Hh}" fill="url(#${u})"/>${cloud(150, 120, 1.4, .95)}${cloud(620, 90, 1.2, .95)}${cloud(420, 200, .9, .8)}${lolli(90, 330, '#ff7ab8')}${lolli(700, 320, '#7fd6ff')}${lolli(760, 360, '#ffd45a')}<ellipse cx="400" cy="530" rx="520" ry="110" fill="#ffc4e2"/>${Array.from({ length: 22 }, (_, i) => `<rect x="${(i * 79) % 780 + 6}" y="${430 + (i * 37) % 60}" width="10" height="4" rx="2" fill="${RB[i % 5]}" transform="rotate(${(i * 47) % 90} ${(i * 79) % 780} ${430 + (i * 37) % 60})"/>`).join('')}`;
  } else if (id === 'night') {
    defs = grad(u, ['#2a1f6b', '#5b3fa8', '#c47dd1']);
    body = `<rect width="${W}" height="${Hh}" fill="url(#${u})"/><circle cx="640" cy="110" r="54" fill="#fff6c7"/><circle cx="660" cy="98" r="48" fill="#4a3498" opacity=".25"/>${twinkles(22, 7, '#fff7d0')}<path d="M0 440 C 160 380 300 460 460 410 C 600 366 700 430 800 400 L800 500 L0 500 Z" fill="#33257a"/><path d="M0 480 C 200 440 360 500 560 462 C 680 440 760 470 800 460 L800 500 L0 500 Z" fill="#26195f"/>`;
  } else if (id === 'meadow') {
    defs = grad(u, ['#a6dcff', '#e7f6ff']);
    const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><rect x="-1.5" y="0" width="3" height="26" fill="#58b36b"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 8).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 8).toFixed(1)}" r="6" fill="${c}"/>`).join('')}<circle r="4.5" fill="#ffe066"/></g>`;
    body = `<rect width="${W}" height="${Hh}" fill="url(#${u})"/>${cloud(140, 90, 1.2)}${cloud(600, 130, 1)}<path d="M0 380 C 160 330 300 400 460 360 C 600 326 700 380 800 350 L800 500 L0 500 Z" fill="#b6e8a8"/><path d="M0 430 C 200 390 360 450 560 412 C 680 390 760 420 800 410 L800 500 L0 500 Z" fill="#8fd68f"/>${Array.from({ length: 16 }, (_, i) => flower((i * 53 + 30) % 780, 420 + (i * 29) % 60, ['#ff8cc4', '#fff', '#ffb27a', '#c7a1ff'][i % 4])).join('')}`;
  } else {
    defs = grad(u, ['#ffd0ea', '#ffe6f3', '#fff1de']);
    body = `<rect width="${W}" height="${Hh}" fill="url(#${u})"/>${cloud(130, 120, 1.3)}${cloud(650, 100, 1.2)}${cloud(430, 230, .8, .75)}${cloud(740, 330, 1.1, .8)}<ellipse cx="400" cy="540" rx="520" ry="110" fill="#ffc4e2" opacity=".85"/>${twinkles(10, 3, '#fff')}`;
  }
  return `<svg class="scene" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}

'use strict';
/* ============ question makers: every call builds a fresh round ============ */
const tagIn = (tok, tags) => tok.tags.some(t => tags.indexOf(t) >= 0);
const aAn = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
const nounType = w => W.person.includes(w) ? 'person' : W.place.includes(w) ? 'place' : W.animal.includes(w) ? 'animal' : 'thing';
const without = (arr, ex) => arr.filter(x => !ex.includes(x));
const BC = ['#ff5fa8', '#8f5cf2', '#38b6f2', '#2fc99e', '#ffb21f', '#ff7a5c'];
const ARTW = ['a', 'an', 'the'];
