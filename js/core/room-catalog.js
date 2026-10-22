/* Picnic Pals — PICNIC SPOT catalog (ids and base prices kept from the old room so saves still work): every shop item (names, prices, kinds). The art lives in games/room/items-art.js.
   kind: floor (stands on a floor square) | rug (flat, under things) | wall (hangs on the back wall) | paper (wallpaper) | tiles (floor style)
   price: star bits (1 bit per star earned in any game). need: a special prize, locked until the achievement is reached (then free).
   seat: friends can sit on it (dy = how high they sit). light: glows at night. */
(function (A) {
  'use strict';
  var TT = A.TITLES || {}; // game titles live in util.js (A.TITLES); node tools that skip util.js just get blank hints
  var CATS = [
    { id: 'cozy', name: 'Beds & seats', icon: '🛏️' }, { id: 'furniture', name: 'Furniture', icon: '🪑' },
    { id: 'plants', name: 'Plants & lamps', icon: '🪴' }, { id: 'toys', name: 'Toys & sports', icon: '⚽' },
    { id: 'rugs', name: 'Rugs', icon: '🟣' }, { id: 'wall', name: 'Wall', icon: '🖼️' },
    { id: 'paper', name: 'Wallpaper & floors', icon: '🎨' }, { id: 'special', name: 'Special prizes', icon: '🏆' }
  ];
  function I(id, name, cat, kind, price, w, x) { var o = { id: id, name: name, cat: cat, kind: kind, price: price, w: w }; for (var k in x || {}) o[k] = x[k]; return o; }
  var ITEMS = [
    I('bed_simple', 'Cozy bed', 'cozy', 'floor', 18, 200, { seat: 46 }), I('bed_cloud', 'Cloud bed', 'cozy', 'floor', 34, 210, { seat: 50 }),
    I('sofa', 'Comfy sofa', 'cozy', 'floor', 22, 200, { seat: 44 }), I('beanbag_pink', 'Pink cushion', 'cozy', 'floor', 8, 110, { seat: 34 }),
    I('beanbag_blue', 'Mint cushion', 'cozy', 'floor', 8, 110, { seat: 34 }), I('chair', 'Stump stool', 'cozy', 'floor', 6, 80, { seat: 40 }),
    I('tent', 'Parasol', 'cozy', 'floor', 26, 180),
    I('table_round', 'Picnic table', 'furniture', 'floor', 10, 120), I('desk', 'Desk', 'furniture', 'floor', 14, 150),
    I('bookshelf', 'Bookshelf', 'furniture', 'floor', 16, 130), I('dresser', 'Dresser', 'furniture', 'floor', 12, 130),
    I('toyshelf', 'Toy shelf', 'furniture', 'floor', 14, 140), I('snackcart', 'Cupcake stand', 'furniture', 'floor', 18, 140),
    I('fishtank', 'Fish tank', 'furniture', 'floor', 24, 150), I('globe', 'Globe', 'furniture', 'floor', 8, 70),
    I('piano', 'Toy piano', 'furniture', 'floor', 18, 140),
    // picnic table-top treats (new in Picnic Spot); base prices sit on the same curve, two are badge-gated in rewards.js
    I('plates', 'Picnic plates', 'furniture', 'floor', 5, 90), I('fruit_bowl', 'Fruit bowl', 'furniture', 'floor', 9, 90),
    I('lemonade_jug', 'Lemonade jug', 'furniture', 'floor', 14, 66), I('thermos', 'Cocoa thermos', 'furniture', 'floor', 18, 50),
    I('plant_tall', 'Leafy plant', 'plants', 'floor', 6, 90), I('plant_cactus', 'Cactus', 'plants', 'floor', 4, 60),
    I('plant_flower', 'Flower pot', 'plants', 'floor', 4, 60), I('plant_tree', 'Little tree', 'plants', 'floor', 12, 120),
    I('lamp_floor', 'Lantern', 'plants', 'floor', 9, 70, { light: '#ffd98a' }), I('lamp_star', 'Star lamp', 'plants', 'floor', 12, 70, { light: '#fff0a0' }),
    I('lamp_mushroom', 'Mushroom lamp', 'plants', 'floor', 10, 80, { light: '#ffb3cf' }),
    I('toybox', 'Picnic basket', 'toys', 'floor', 10, 120), I('blocks', 'Block tower', 'toys', 'floor', 5, 70), I('train', 'Toy train', 'toys', 'floor', 9, 130),
    I('drum', 'Drum', 'toys', 'floor', 7, 80), I('rocket', 'Toy rocket', 'toys', 'floor', 15, 80), I('plush_bunny', 'Bunny plush', 'toys', 'floor', 6, 70),
    I('easel', 'Paint easel', 'toys', 'floor', 11, 100), I('telescope', 'Telescope', 'toys', 'floor', 20, 100),
    I('soccergoal', 'Mini goal', 'toys', 'floor', 16, 170), I('soccerball', 'Soccer ball', 'toys', 'floor', 3, 46),
    I('batrack', 'Bat and glove rack', 'toys', 'floor', 12, 100), I('hoop', 'Mini hoop', 'toys', 'floor', 14, 100),
    I('rug_round', 'Picnic blanket', 'rugs', 'rug', 6, 230), I('rug_rainbow', 'Rainbow rug', 'rugs', 'rug', 12, 250),
    I('rug_star', 'Star rug', 'rugs', 'rug', 10, 230), I('rug_diamond', 'Ballpark rug', 'rugs', 'rug', 9, 230),
    I('poster_space', 'Space poster', 'wall', 'wall', 5, 100), I('poster_mochi', 'Dora Dumpling poster', 'wall', 'wall', 5, 100),
    I('poster_baseball', 'Baseball poster', 'wall', 'wall', 5, 100), I('frame_sun', 'Strawberry picture', 'wall', 'wall', 7, 110),
    I('clock', 'Clock', 'wall', 'wall', 8, 80), I('shelf_wall', 'Wall shelf', 'wall', 'wall', 9, 120),
    I('fairylights', 'Fairy lights', 'wall', 'wall', 10, 130, { light: '#fff3b0' }), I('pennant', 'Bunting', 'wall', 'wall', 4, 220),
    I('mirror', 'Mirror', 'wall', 'wall', 8, 80),
    I('wp_cream', 'Cream wallpaper', 'paper', 'paper', 0, 0, { starter: true }), I('wp_stripes', 'Candy stripes', 'paper', 'paper', 8, 0),
    I('wp_dots', 'Polka dots', 'paper', 'paper', 8, 0), I('wp_stars', 'Starry wallpaper', 'paper', 'paper', 12, 0),
    I('wp_clouds', 'Cloud wallpaper', 'paper', 'paper', 12, 0), I('wp_leaves', 'Leafy wallpaper', 'paper', 'paper', 10, 0),
    I('fl_wood', 'Wood floor', 'paper', 'tiles', 0, 0, { starter: true }), I('fl_checker', 'Checker floor', 'paper', 'tiles', 8, 0),
    I('fl_carpet', 'Soft carpet', 'paper', 'tiles', 8, 0), I('fl_tiles', 'Mint tiles', 'paper', 'tiles', 8, 0),
    I('trophy_story', 'Story trophy', 'special', 'floor', 0, 90, { need: 'story', hint: 'Finish Story mode in ' + TT.munch }),
    I('bat_gold', 'Golden bat', 'special', 'floor', 0, 90, { need: 'bb10', hint: 'Score 10 runs in one ' + TT.baseball + ' game' }),
    I('plush_grumbly', 'Grumbly plush', 'special', 'floor', 0, 90, { need: 'grumbly', hint: 'Beat Grumbly in ' + TT.munch }),
    I('rug_sticker', 'Sticker rug', 'special', 'rug', 0, 240, { need: 'stickers10', hint: 'Collect 10 stickers' }),
    I('star_big', 'Giant star', 'special', 'wall', 0, 110, { need: 'stars100', hint: 'Earn 100 stars' }),
    I('hr_ball', 'Home run ball', 'special', 'wall', 0, 90, { need: 'homer', hint: 'Hit a home run in ' + TT.baseball })
  ];
  var BY = {}; ITEMS.forEach(function (it) { BY[it.id] = it; });
  var NEEDS = {
    story: function (p) { return ((p.story || {}).finished || 0) >= 1; },
    bb10: function (p) { return ((p.games.baseball || {}).best || 0) >= 10; },
    grumbly: function (p) { return ((p.games.munch || {}).grumblyWins || 0) >= 1; },
    stickers10: function (p) { return Object.keys(p.stickers || {}).length >= 10; },
    stars100: function (p) { return (p.stars || 0) >= 100; },
    homer: function (p) { return ((p.games.baseball || {}).homers || 0) >= 1; }
  };
  A.RoomCatalog = { CATS: CATS, ITEMS: ITEMS, byId: BY, NEEDS: NEEDS,
    earned: function (p, it) { return !it.need || (NEEDS[it.need] ? NEEDS[it.need](p) : false); } };
})(window.Arcade);
