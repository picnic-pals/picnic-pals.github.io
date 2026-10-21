/* Blob Arcade — Sight Words data (stub for the upcoming Sight Words game).
   Standard Dolch lists: Pre-Primer (40 words) and Primer (52 words). */
(function (A) {
  'use strict';
  var PREPRIMER = ['a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
    'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'];
  var PRIMER = ['all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came', 'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
    'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran', 'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
    'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will', 'with', 'yes'];
  function id(w) { return 'word_' + String(w).toLowerCase().replace(/[^a-z]/g, ''); }
  A.SightWords = {
    lists: [
      { id: 'dolch_preprimer', name: 'Dolch Pre-Primer', words: PREPRIMER },
      { id: 'dolch_primer', name: 'Dolch Primer', words: PRIMER }
    ],
    PREPRIMER: PREPRIMER, PRIMER: PRIMER, lineId: id,
    // Planned game flow (not built yet): introduce 3–4 new words at a time, mastery = read correctly on 3 separate days.
    plan: { newPerSession: 3, masteryDays: 3 }
  };
})(window.Arcade);
