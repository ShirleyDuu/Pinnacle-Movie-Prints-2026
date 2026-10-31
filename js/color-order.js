// Generated once from the poster artwork. Each pair is [dominant hue, movie ranks].
// This avoids scanning image pixels whenever the site opens.
const fixedColorPosterGroups = [
  // Sweep clockwise around the color wheel: red → orange → yellow → green → cyan → blue → purple → pink.
  [354, [81,155,93,52,19,137,84,4,95,104,131,165]],
  [6, [65,36,20,132,3,71,38,5,150,103,128,59,45,90,66,153,75,77,129,28,117]],
  [18, [2,58,111,122,13,163,30,89,15,105,88,69]],
  [30, [34,167,161,134,113,133,54,41,126,67,130,154,12,112,168,100,101,136,53,1,48]],
  [42, [8,160,156,37,114,127,85,21,62,164,135,70,152,124,72,33,61,74,10,107,86,79,116,73,35,23]],
  [54, [26,91,46,125,39,29,140,166,11,151,9,120,44,109,51]],
  [66, [40,139,148,22]], [138, [94,42,31,96,17]], [162, [118]], [186, [144,50,158,162]],
  [198, [99,32,82,143,27]], [210, [60,138,83,106,56,121,108,80,64,68,123]],
  [222, [87,142,24,7,6,98]], [234, [55]], [318, [149]], [330, [146]],
  [342, [147,119]],
  // In the grayscale ending, keep subtle color accents first, then sweep from light gray to near-black.
  [null, [47,43,63,110,157,92,14,49,16,57,102,76,115,78,18,97,141,25,159,145]]
];

const fixedColorPosterOrder = Object.freeze(
  fixedColorPosterGroups.flatMap(([hue, ranks]) => ranks.map(rank => ({ rank, hue, isNeutral: hue === null })))
);
