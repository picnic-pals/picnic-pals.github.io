/* Picnic Pals — garden-only friends. Names and grow-needs are placeholders and live in FRIENDS below so they can be changed in one place.
   These are appended to FoodData.cast but NEVER to FoodData.order, so they stay out of the regular unlock track and basket reveals. */
(function (A) {
  'use strict';
  var FRIENDS = [
    { id: 'peapod', name: 'Pip', need: 10, food: 'Pea pod', size: 1.05,
      colors: { main: '#7cbc3a', light: '#d8f3a8', dark: '#4e8e22', outline: '#326616' },
      looks: 'Upright teardrop pea pod with a friendly face',
      personality: 'Tiny, bouncy, and full of ideas.',
      favorite: 'Hiding in the garden with friends',
      catchphrase: 'Pea-lease, let us play!' },
    { id: 'potato', name: 'Spud', need: 25, food: 'Potato', size: 1.0,
      colors: { main: '#c4a574', light: '#efe0c4', dark: '#8a6a3c', outline: '#5e4524' },
      looks: 'Plump golden potato with a tiny sprout and dirt-dusted cheeks',
      personality: 'Sturdy, kind, and a good listener.',
      favorite: 'Cool naps in the soil',
      catchphrase: 'You can count on me!' },
    { id: 'tomato', name: 'Rosie', need: 25, food: 'Tomato', size: 0.9,
      colors: { main: '#e85d4c', light: '#ffd4cc', dark: '#c43c30', outline: '#8f241c' },
      looks: 'Round red tomato with a longer stem and confident brows',
      personality: 'Bright, cheerful, and a little shy at first.',
      favorite: 'Warm sunny mornings',
      catchphrase: 'Ripe and ready!' },
    { id: 'cherries', name: 'Sherry and Terry', need: 35, food: 'Cherries', size: 1.0,
      colors: { main: '#d23a4a', light: '#ffd0d4', dark: '#a02230', outline: '#6e1420' },
      looks: 'Two cherries on one green stem, each with their own hands',
      personality: 'Two best-friend cherries who always stick together.',
      favorite: 'Swinging from the same stem',
      catchphrase: 'Two smiles are better than one!' },
    { id: 'pumpkin', name: 'Patch', need: 50, food: 'Pumpkin', size: 1.15,
      colors: { main: '#f08a2a', light: '#ffd7a8', dark: '#d06814', outline: '#8f4a0e' },
      looks: 'Classic ribbed pumpkin with a curly tendril and a leaf',
      personality: 'Cozy, round, and loves autumn days.',
      favorite: 'Sitting in a soft leaf pile',
      catchphrase: 'What a patch of fun!' }
  ];

  var FD = A.FoodData || (A.FoodData = { lead: 'strawberry', starters: [], order: [], poses: [], cast: [], anchors: {} });
  var ids = FRIENDS.map(function (f) { return f.id; });
  var BY = {};
  FRIENDS.forEach(function (f) {
    BY[f.id] = f;
    var exists = (FD.cast || []).some(function (c) { return c.id === f.id; });
    if (exists) return;
    FD.cast = FD.cast || [];
    FD.cast.push({
      id: f.id, name: f.name, placeholder: true, food: f.food, status: 'Garden', unlock: null,
      size: f.size, colors: f.colors, looks: f.looks, personality: f.personality,
      favorite: f.favorite, catchphrase: f.catchphrase
    });
  });
  FD.garden = ids;
  FD.gardenFriends = FRIENDS;
  function nameOf(id) { return (BY[id] && BY[id].name) || 'friend'; }
  function needOf(id) { return (BY[id] && BY[id].need) || 25; }
  function isGarden(id) { return ids.indexOf(id) >= 0; }
  A.GardenFriends = { FRIENDS: FRIENDS, ids: ids, byId: BY, nameOf: nameOf, needOf: needOf, isGarden: isGarden };
})(window.Arcade = window.Arcade || {});
