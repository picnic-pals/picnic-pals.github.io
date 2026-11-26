/* Picnic Pals — Garden art helpers. Anchors and visual bboxes from assets/garden/anchors.json. */
(function (A) {
  'use strict';
  var ROOT = A.ROOT || '../../';
  var DIR = ROOT + 'assets/garden/';
  var SCENE = ROOT + 'art/garden/';
  var ANCHORS = {
  "units": "1x stage px (multiply by 2 for -2x files)",
  "stage": {
    "landscape": [
      1024,
      640
    ],
    "portrait": [
      400,
      720
    ]
  },
  "play_band": "scene art keeps the bed and friend in the upper 2/3; the bottom 1/3 is calm lawn for the seed tray/card. With UI kit set B: landscape keep y<180 (title+card) and y>500 (shelf tray) free of key art; portrait keep y<160 and y>472 free (card at y=482 for Garden)",
  "friend_note": "Draw the player's friend sprite with its feet (body bottom, not any baked shadow) at foot, and props/contact_shadow.png centred on foot under it (width ~1.05x the sprite width).",
  "seed_types": [
    "peapod",
    "potato",
    "tomato",
    "cherries",
    "pumpkin"
  ],
  "status": "locked",
  "option": "A",
  "landscape": {
    "file": "bg/garden_A_landscape.png",
    "file_2x": "bg/garden_A_landscape-2x.png",
    "dirt_patch": {
      "bbox_xywh": [
        123,
        307,
        372,
        75
      ],
      "safe_drop_bbox_xyxy": [
        133,
        312,
        487,
        377
      ],
      "polygon": [
        [
          123,
          381
        ],
        [
          493,
          381
        ],
        [
          494,
          377
        ],
        [
          453,
          311
        ],
        [
          422,
          307
        ],
        [
          179,
          309
        ],
        [
          172,
          313
        ]
      ]
    },
    "drop_spots": [
      {
        "id": 1,
        "row": 0,
        "col": 0,
        "x": 196,
        "y": 331
      },
      {
        "id": 2,
        "row": 0,
        "col": 1,
        "x": 310,
        "y": 331
      },
      {
        "id": 3,
        "row": 0,
        "col": 2,
        "x": 423,
        "y": 331
      },
      {
        "id": 4,
        "row": 1,
        "col": 0,
        "x": 196,
        "y": 360
      },
      {
        "id": 5,
        "row": 1,
        "col": 1,
        "x": 310,
        "y": 360
      },
      {
        "id": 6,
        "row": 1,
        "col": 2,
        "x": 423,
        "y": 360
      }
    ],
    "friend": {
      "foot": [
        675,
        415
      ],
      "height": 150
    }
  },
  "portrait": {
    "file": "bg/garden_A_portrait.png",
    "file_2x": "bg/garden_A_portrait-2x.png",
    "dirt_patch": {
      "bbox_xywh": [
        49,
        348,
        254,
        65
      ],
      "safe_drop_bbox_xyxy": [
        56,
        351,
        298,
        409
      ],
      "polygon": [
        [
          49,
          412
        ],
        [
          302,
          409
        ],
        [
          273,
          351
        ],
        [
          147,
          348
        ],
        [
          85,
          350
        ],
        [
          78,
          356
        ]
      ]
    },
    "drop_spots": [
      {
        "id": 1,
        "row": 0,
        "col": 0,
        "x": 99,
        "y": 368
      },
      {
        "id": 2,
        "row": 0,
        "col": 1,
        "x": 177,
        "y": 368
      },
      {
        "id": 3,
        "row": 0,
        "col": 2,
        "x": 254,
        "y": 368
      },
      {
        "id": 4,
        "row": 1,
        "col": 0,
        "x": 99,
        "y": 394
      },
      {
        "id": 5,
        "row": 1,
        "col": 1,
        "x": 177,
        "y": 394
      },
      {
        "id": 6,
        "row": 1,
        "col": 2,
        "x": 254,
        "y": 394
      }
    ],
    "friend": {
      "foot": [
        50,
        456
      ],
      "height": 78
    }
  }
};

  var BED_SPOTS = [
    { x: 335.2, y: 489.1, id: 1, row: 0, col: 0, name: 'back_left' },
    { x: 536.7, y: 504.4, id: 2, row: 0, col: 1, name: 'back_mid' },
    { x: 740.6, y: 522.6, id: 3, row: 0, col: 2, name: 'back_right' },
    { x: 264.0, y: 633.3, id: 4, row: 1, col: 0, name: 'front_left' },
    { x: 480.9, y: 653.0, id: 5, row: 1, col: 1, name: 'front_mid' },
    { x: 697.3, y: 669.2, id: 6, row: 1, col: 2, name: 'front_right' }
  ];
  var SHELF_SLOTS = [
    { index: 0, id: 'potato', x: 258.0, y: 760.0 },
    { index: 1, id: 'tomato', x: 396.0, y: 786.0 },
    { index: 2, id: 'pumpkin', x: 536.5, y: 812.0 },
    { index: 3, id: 'peapod', x: 679.0, y: 839.0 },
    { index: 4, id: 'cherries', x: 818.0, y: 836.0 }
  ];
  /* Opaque-body bbox in the 512 or 1024 canvas; packet foot is body bottom, not the contact shadow. */
  var BBOX = {
    soil_bed: [36, 331, 979, 992],
    seed_shelf: [40, 255, 975, 999],
    seed_packet_potato: [88, 28, 421, 484],
    seed_packet_tomato: [62, 28, 439, 484],
    seed_packet_pumpkin: [76, 28, 429, 484],
    seed_packet_peapod: [73, 28, 411, 481],
    seed_packet_cherries: [73, 28, 435, 489],
    watering_can_upright: [28, 146, 484, 483],
    watering_can_pour: [28, 99, 484, 478],
    water_stream: [155, 28, 357, 489],
    stage: [28, 28, 484, 489]
  };

  var STAGE_FILE = {
    seed: 'seed', sprout: 'sprout', small: 'small', grown: 'grown',
    peek: 'popout', popout: 'popout', hop: 'hop', wave: 'wave', pop: 'hop'
  };

  function src(name) { return DIR + name + '.webp'; }
  function packetSrc(id) { return SCENE + 'seedbag_' + id + '.webp'; }
  function packetSrc2x(id) { return SCENE + 'seedbag_' + id + '-2x.webp'; }
  function stageSrc(id, stage) {
    var file = STAGE_FILE[stage] || stage;
    return src('stage_' + id + '_' + file);
  }
  function bgSrc(land) { return SCENE + (land ? 'bg_landscape.webp' : 'bg_portrait.webp'); }
  function bgSrc2x(land) { return SCENE + (land ? 'bg_landscape-2x.webp' : 'bg_portrait-2x.webp'); }
  function shadowSrc() { return SCENE + 'contact_shadow.webp'; }
  function pack(land) { return ANCHORS[land ? 'landscape' : 'portrait']; }
  function stageSpots(land) { return pack(land).drop_spots; }
  function friendAnchor(land) { return pack(land).friend; }
  function dirtPatch(land) { return pack(land).dirt_patch; }

  function placeCanvas(el, canvas, bbox, destX, destY, destW) {
    var visW = bbox[2] - bbox[0], visH = bbox[3] - bbox[1];
    var scale = destW / visW;
    var img = canvas * scale;
    el.style.position = 'absolute';
    el.style.left = (destX - bbox[0] * scale) + 'px';
    el.style.top = (destY - bbox[1] * scale) + 'px';
    el.style.width = img + 'px';
    el.style.height = img + 'px';
    return { scale: scale, img: img, destW: destW, destH: visH * scale, left: destX - bbox[0] * scale, top: destY - bbox[1] * scale };
  }

  function canvasToScene(placed, cx, cy) {
    return { x: placed.left + cx * placed.scale, y: placed.top + cy * placed.scale };
  }

  A.GardenArt = {
    DIR: DIR,
    SCENE: SCENE,
    ANCHORS: ANCHORS,
    PACKET_SCALE: 0.36,
    CARD_Y_PORTRAIT: 482,
    TRAY_Y_PORTRAIT: 676,
    CARD_LANDSCAPE: { x: 232, y: 108, w: 560, h: 108 },
    TRAY_Y_LANDSCAPE: 568,
    CANVAS: { sprite: 512, bed: 1024, shelf: 1024, portrait: [1080, 1920], landscape: [1920, 1080] },
    BED_SPOTS: BED_SPOTS,
    SHELF_SLOTS: SHELF_SLOTS,
    BBOX: BBOX,
    POUR_SPOUT: { x: 448.2, y: 288.8 },
    STREAM_TOP: { x: 256.0, y: 28.0 },
    PLAY_BAND: { x: 0, y: 640, w: 1080, h: 640 },
    CARD_BAND: { x: 0, y: 1280, w: 1080, h: 640 },
    src: src,
    packetSrc: packetSrc,
    packetSrc2x: packetSrc2x,
    stageSrc: stageSrc,
    bgSrc: bgSrc,
    bgSrc2x: bgSrc2x,
    shadowSrc: shadowSrc,
    pack: pack,
    stageSpots: stageSpots,
    friendAnchor: friendAnchor,
    dirtPatch: dirtPatch,
    placeCanvas: placeCanvas,
    canvasToScene: canvasToScene,
    packetFoot: function (id) {
      var b = BBOX['seed_packet_' + id] || [73, 28, 420, 484];
      return { x: (b[0] + b[2]) / 2, y: b[3] };
    },
    stageFoot: function () { return { x: 256, y: 489 }; }
  };
})(window.Arcade = window.Arcade || {});
