/* v0.4 extra reading passages (reading_passages_e2). Live in play after the adult read-through.
   See arcade/_plans/passages-e2-review.md. Device voice via {id,text}; do NOT require generate-tts.py. */
(function (A) {
  'use strict';
  var E2 = [
  {
    "id": "p07",
    "title": "The Porch Lantern",
    "kind": "fiction",
    "level": "grade 2-3 stretch (estimated, not formally leveled)",
    "text": "{hero} and Mo hung a paper lantern on the porch. The wind tugged it, and the lantern bumped the railing. Mo ran inside to get tape. While Mo was gone, the lantern slipped and landed in a bush, still glowing. {hero} picked it up and hung it on a hook under the roof. When Mo came back with the tape, the lantern was already safe. \"The wind can't reach it now,\" said {hero}. Mo laughed. \"Then I brought the tape for nothing!\" \"No,\" said {hero}. \"We can use it tomorrow, when we hang the other one.\"",
    "questions": [
      {
        "type": "literal",
        "q": "Where did the lantern land after it slipped?",
        "choices": [
          "in a bush",
          "under the roof",
          "inside the house",
          "on the railing"
        ],
        "answer": 0,
        "evidence": "the lantern slipped and landed in a bush"
      },
      {
        "type": "sequence",
        "q": "What did Mo do first?",
        "choices": [
          "hung the lantern on the hook",
          "hung the other lantern",
          "ran inside to get tape",
          "picked up the lantern"
        ],
        "answer": 2,
        "evidence": "Mo ran inside to get tape"
      },
      {
        "type": "inference",
        "q": "Why did {hero} hang the lantern on a hook under the roof?",
        "choices": [
          "The bush was too dark.",
          "The wind had knocked it down, and the roof would block the wind.",
          "Mo asked for a higher hook.",
          "The hook only works under the roof."
        ],
        "answer": 1,
        "evidence": [
          "The wind tugged it",
          "landed in a bush",
          "The wind can't reach it now"
        ],
        "reasoning": "join the earlier wind problem with the reason {hero} gives after moving it"
      },
      {
        "type": "inference",
        "q": "Why does {hero} say the tape is still useful?",
        "choices": [
          "The lantern is still broken.",
          "Mo likes to carry tape.",
          "They will hang another lantern tomorrow.",
          "The roof needs more tape."
        ],
        "answer": 2,
        "evidence": [
          "Then I brought the tape for nothing",
          "We can use it tomorrow, when we hang the other one"
        ],
        "reasoning": "Mo thinks the tape is wasted, but {hero} already has a next job for it"
      }
    ]
  },
  {
    "id": "p08",
    "title": "A New Green",
    "kind": "fiction",
    "level": "grade 2-3 stretch (estimated, not formally leveled)",
    "text": "Pip wanted to paint the reeds by the pond, but her paint box held only blue and brown. \"I can't paint the green reeds,\" she said. Tully looked at the two colors. \"Try a little blue on the brown,\" he said. Pip mixed a tiny bit of each on a lid. A dark green showed up. She painted the reeds first, then the blue water, then a brown path. Tully grinned. \"You made a new color without a new tube of paint.\"",
    "questions": [
      {
        "type": "literal",
        "q": "Which colors were in Pip's paint box?",
        "choices": [
          "green and blue",
          "blue and brown",
          "red and yellow",
          "only brown"
        ],
        "answer": 1,
        "evidence": "her paint box held only blue and brown"
      },
      {
        "type": "cause_effect",
        "q": "Why did Pip think she could not paint the reeds?",
        "choices": [
          "She did not have green paint.",
          "The pond was too far away.",
          "Tully hid the paint.",
          "The lid was broken."
        ],
        "answer": 0,
        "evidence": "\"I can't paint the green reeds,\" she said"
      },
      {
        "type": "inference",
        "q": "How did the dark green show up?",
        "choices": [
          "Tully bought a new tube.",
          "The sun changed the blue paint.",
          "Pip mixed the blue and brown she already had.",
          "The water in the pond dripped on the lid."
        ],
        "answer": 2,
        "evidence": [
          "Try a little blue on the brown",
          "Pip mixed a tiny bit of each on a lid. A dark green showed up"
        ],
        "reasoning": "connect Tully's idea with what happened when Pip mixed the two colors"
      },
      {
        "type": "vocab",
        "q": "In this story, 'grinned' means Tully...",
        "choices": [
          "looked angry",
          "smiled widely",
          "fell asleep",
          "closed the box"
        ],
        "answer": 1,
        "evidence": "Tully grinned. \"You made a new color"
      }
    ]
  },
  {
    "id": "p09",
    "title": "Why We Have Day and Night",
    "kind": "nonfiction",
    "level": "grade 2-3 stretch (estimated, not formally leveled)",
    "text": "Earth is always spinning. It makes one full spin about every 24 hours. We call that a day. Day and night happen because Earth spins. When a place on Earth is facing toward the sun, it is daytime there. When that place is facing away from the sun, it is nighttime there. As Earth keeps spinning, the same place moves from light into dark and back into light again. Earth does this all year as it also travels around the sun.",
    "questions": [
      {
        "type": "literal",
        "q": "About how long does Earth take to make one full spin?",
        "choices": [
          "one year",
          "24 hours",
          "one season",
          "one hour"
        ],
        "answer": 1,
        "evidence": "It makes one full spin about every 24 hours"
      },
      {
        "type": "cause_effect",
        "q": "When is it nighttime in a place?",
        "choices": [
          "When that place is facing away from the sun.",
          "When Earth stops spinning.",
          "When clouds cover the moon.",
          "When Earth is farther from the sun."
        ],
        "answer": 0,
        "evidence": "When that place is facing away from the sun, it is nighttime there"
      },
      {
        "type": "sequence",
        "q": "What happens as Earth keeps spinning?",
        "choices": [
          "The sun moves to a new star.",
          "Day stays on one side forever.",
          "A place moves from light into dark and back into light.",
          "Night begins only in winter."
        ],
        "answer": 2,
        "evidence": "the same place moves from light into dark and back into light again"
      },
      {
        "type": "inference",
        "q": "If it is daytime where {hero} is, what must be true?",
        "choices": [
          "The moon is closer than the sun.",
          "That place is facing toward the sun.",
          "Earth has stopped for 24 hours.",
          "It is nighttime on the whole planet."
        ],
        "answer": 1,
        "evidence": [
          "When a place on Earth is facing toward the sun, it is daytime there",
          "When that place is facing away from the sun, it is nighttime there"
        ],
        "reasoning": "use the facing-toward rule, and rule out the facing-away case"
      }
    ],
    "source": "Fact-checked against NASA, 'What Is Earth? (Grades K-4)', section 'Why Do We Have Day and Night?' and 'How Does Earth Move?', https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-earth-grades-k-4/ , read Nov 11, 2026: Earth makes a full spin once every 24 hours (a day). Day and night happen as Earth spins. Places facing toward the sun have daytime; places facing away have nighttime."
  },
  {
    "id": "p10",
    "title": "Beaver Dams and Lodges",
    "kind": "nonfiction",
    "level": "grade 2-3 stretch (estimated, not formally leveled)",
    "text": "A beaver dam is a wall of trees, branches, grass, rocks, and mud that a beaver builds across a stream. Beavers cut the trees with their strong front teeth. The dam slows the water and makes a pond. Beavers do not live inside the dam. They build a home called a lodge in the pond. The lodge is made of sticks, rocks, and mud, and its door is under the water. In the lodge, beavers can sleep, raise their young, and hide from animals that hunt them. The pond is also useful to other animals, like birds and fish.",
    "questions": [
      {
        "type": "literal",
        "q": "What do beavers use to cut trees?",
        "choices": [
          "their front teeth",
          "rocks only",
          "the lodge door",
          "bird beaks"
        ],
        "answer": 0,
        "evidence": "Beavers cut the trees with their strong front teeth"
      },
      {
        "type": "vocab",
        "q": "In this text, a 'lodge' is...",
        "choices": [
          "the dam across the stream",
          "the beaver's home in the pond",
          "a kind of fish",
          "a pile of grass only"
        ],
        "answer": 1,
        "evidence": "They build a home called a lodge in the pond"
      },
      {
        "type": "inference",
        "q": "Why is the lodge door under the water?",
        "choices": [
          "So rain can fill the lodge.",
          "So the dam will stay dry.",
          "So animals that hunt beavers cannot walk in easily.",
          "So fish can live in the lodge."
        ],
        "answer": 2,
        "evidence": [
          "its door is under the water",
          "hide from animals that hunt them"
        ],
        "reasoning": "the underwater door is part of staying hidden from hunters"
      },
      {
        "type": "cause_effect",
        "q": "What happens when a beaver dam slows a stream?",
        "choices": [
          "The stream dries up at once.",
          "A pond forms.",
          "The lodge moves onto land.",
          "Birds can no longer visit."
        ],
        "answer": 1,
        "evidence": "The dam slows the water and makes a pond"
      }
    ],
    "source": "Fact-checked against U.S. National Park Service, 'Build a Beaver Dam', https://www.nps.gov/articles/buildabeaverdam.htm , read Nov 11, 2026: A dam of logs, branches, grass, rocks, and mud slows or blocks a stream and makes a pond. Beavers cut trees with their front teeth. They do not live in the dam. They build a lodge in the pond, with an underwater entrance, to stay safe from predators. The pond also helps other wetland animals, including birds and fish."
  },
  {
    "id": "p11",
    "title": "Why We Have Seasons",
    "kind": "nonfiction",
    "level": "grade 2-3 stretch (estimated, not formally leveled)",
    "text": "Earth is tilted as it travels around the Sun. That tilt is why we have seasons. When the North Pole tilts toward the Sun, the northern half of Earth gets more direct sunlight, and it is summer there. When the North Pole tilts away from the Sun, the northern half gets less direct sunlight, and it is winter there. Some people think summer comes because Earth is closer to the Sun, but that is not the reason. Earth's path is a little lopsided, and Earth is actually closer to the Sun in January, when it is winter in the north.",
    "questions": [
      {
        "type": "literal",
        "q": "What does the text say is the reason for seasons?",
        "choices": [
          "Earth's tilt as it travels around the Sun",
          "Clouds that block the Moon",
          "Earth stopping its spin",
          "The Sun moving closer in July"
        ],
        "answer": 0,
        "evidence": "Earth is tilted as it travels around the Sun. That tilt is why we have seasons"
      },
      {
        "type": "cause_effect",
        "q": "When is it summer in the northern half of Earth?",
        "choices": [
          "When Earth is closest to the Sun",
          "When the North Pole tilts toward the Sun",
          "When the North Pole tilts away from the Sun",
          "When January begins"
        ],
        "answer": 1,
        "evidence": "When the North Pole tilts toward the Sun, the northern half of Earth gets more direct sunlight, and it is summer there"
      },
      {
        "type": "vocab",
        "q": "In this text, 'lopsided' describes Earth's path as...",
        "choices": [
          "perfectly round",
          "a little uneven, not a perfect circle",
          "straight like a line",
          "too small to measure"
        ],
        "answer": 1,
        "evidence": "Earth's path is a little lopsided"
      },
      {
        "type": "inference",
        "q": "Why is being closer to the Sun not what makes summer in the north?",
        "choices": [
          "The Sun is colder in January.",
          "Earth does not travel around the Sun.",
          "Earth is closer to the Sun in January, when it is winter in the north.",
          "The North Pole never tilts."
        ],
        "answer": 2,
        "evidence": [
          "Some people think summer comes because Earth is closer to the Sun, but that is not the reason",
          "Earth is actually closer to the Sun in January, when it is winter in the north"
        ],
        "reasoning": "the closeness happens during northern winter, so closeness cannot be what causes summer"
      }
    ],
    "source": "Fact-checked against NASA Space Place, 'What Causes the Seasons?', https://spaceplace.nasa.gov/seasons/en/ , read Nov 11, 2026: Earth's tilted axis causes the seasons, not its changing distance from the Sun. When the North Pole tilts toward the Sun it is summer in the Northern Hemisphere; when it tilts away it is winter there. Earth's orbit is slightly lopsided, and in the Northern Hemisphere winter happens when Earth is closest to the Sun, so distance is not the cause."
  }
];

  function live() {
    if (A.PassagesE2 && A.PassagesE2.live === true) return true;
    try {
      if (A.Store && A.Store.settings && A.Store.settings.passagesE2) return true;
      if (typeof location !== 'undefined' && /(?:\?|&)e2=1\b/.test(location.search)) return true;
    } catch (e) {}
    return false;
  }

  A.PassagesE2 = {
    live: true,
    ALL: E2,
    isLive: live,
    byId: function (id) { return E2.filter(function (p) { return p.id === id; })[0] || null; }
  };
})(window.Arcade);
