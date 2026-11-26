/* Picnic Pals — locked Story art set (Overview A Picnic Island, silhouettes, face-offs). Data from art/story; images live under arcade/art/story/. */
(function (A) {
  'use strict';
  var ROOT = (A.ROOT || '') + 'art/story/';
  var REGIONS = {"portrait":{"file":"overview_portrait.webp","size":[800,1440],"regions":{"meadow":{"center":[366,1310],"bbox":[80,1140,560,240],"bbox_xyxy":[80,1140,640,1380]},"lagoon":{"center":[394,1116],"bbox":[180,960,480,184],"bbox_xyxy":[180,960,660,1144]},"hills":{"center":[396,926],"bbox":[190,804,420,160],"bbox_xyxy":[190,804,610,964]},"woods":{"center":[400,770],"bbox":[196,630,424,170],"bbox_xyxy":[196,630,620,800]},"peaks":{"center":[400,600],"bbox":[224,444,376,180],"bbox_xyxy":[224,444,600,624]},"bay":{"center":[400,424],"bbox":[190,276,420,164],"bbox_xyxy":[190,276,610,440]},"caves":{"center":[420,246],"bbox":[200,64,424,200],"bbox_xyxy":[200,64,624,264]}}},"landscape":{"file":"overview_landscape.webp","size":[2048,1280],"regions":{"meadow":{"center":[206,690],"bbox":[40,380,340,520],"bbox_xyxy":[40,380,380,900]},"lagoon":{"center":[510,624],"bbox":[380,390,280,560],"bbox_xyxy":[380,390,660,950]},"hills":{"center":[790,636],"bbox":[660,380,270,520],"bbox_xyxy":[660,380,930,900]},"woods":{"center":[1054,630],"bbox":[924,380,270,540],"bbox_xyxy":[924,380,1194,920]},"peaks":{"center":[1320,624],"bbox":[1194,330,276,580],"bbox_xyxy":[1194,330,1470,910]},"bay":{"center":[1586,624],"bbox":[1470,360,266,580],"bbox_xyxy":[1470,360,1736,940]},"caves":{"center":[1836,624],"bbox":[1724,370,296,510],"bbox_xyxy":[1724,370,2020,880]}}},"style":"A","world_order":["meadow","lagoon","hills","woods","peaks","bay","caves"]};
  var CLOUDS = {"portrait":{"meadow":{"pct":{"left":3.38,"top":76.67,"width":81.38,"height":22.64},"plate":[183,655],"x":13.5,"y":552.0,"w":325.5,"h":163.0},"lagoon":{"pct":{"left":16.0,"top":64.51,"width":72.5,"height":18.47},"plate":[197,558],"x":64.0,"y":464.5,"w":290.0,"h":133.0},"hills":{"pct":{"left":17.12,"top":53.26,"width":63.75,"height":17.22},"plate":[198,463],"x":68.5,"y":383.5,"w":255.0,"h":124.0},"woods":{"pct":{"left":20.38,"top":41.04,"width":61.75,"height":16.18},"plate":[200,385],"x":81.5,"y":295.5,"w":247.0,"h":116.5},"peaks":{"pct":{"left":24.0,"top":28.33,"width":57.0,"height":16.6},"plate":[200,300],"x":96.0,"y":204.0,"w":228.0,"h":119.5},"bay":{"pct":{"left":17.25,"top":16.94,"width":65.25,"height":15.21},"plate":[200,212],"x":69.0,"y":122.0,"w":261.0,"h":109.5},"caves":{"pct":{"left":19.62,"top":2.01,"width":64.62,"height":19.86},"plate":[210,123],"x":78.5,"y":14.5,"w":258.5,"h":143.0}},"landscape":{"meadow":{"pct":{"left":-1.03,"top":25.78,"width":22.95,"height":50.08},"plate":[103,345],"x":-10.5,"y":165.0,"w":235.0,"h":320.5},"lagoon":{"pct":{"left":15.67,"top":27.89,"width":18.99,"height":48.44},"plate":[255,312],"x":160.5,"y":178.5,"w":194.5,"h":310.0},"hills":{"pct":{"left":29.39,"top":26.41,"width":18.8,"height":48.2},"plate":[395,318],"x":301.0,"y":169.0,"w":192.5,"h":308.5},"woods":{"pct":{"left":42.38,"top":26.33,"width":18.7,"height":50.0},"plate":[527,315],"x":434.0,"y":168.5,"w":191.5,"h":320.0},"peaks":{"pct":{"left":55.42,"top":22.58,"width":19.19,"height":52.81},"plate":[660,312],"x":567.5,"y":144.5,"w":196.5,"h":338.0},"bay":{"pct":{"left":69.58,"top":25.39,"width":17.92,"height":52.27},"plate":[793,312],"x":712.5,"y":162.5,"w":183.5,"h":334.5},"caves":{"pct":{"left":81.3,"top":25.55,"width":20.41,"height":45.39},"plate":[918,312],"x":832.5,"y":163.5,"w":209.0,"h":290.5}}};
  var ANCHORS = {"meadow":{"world":"meadow","boss":"Bramble","notes":"Official Bramble portrait is front-facing and is composited on the right, matching the approved meadow pattern. The left side is reserved for a code-drawn hero (soft ground spot only). No friend characters are painted in. The background is the official meadow locked_scene with any friend silhouette removed; the official boss is left in place and over-composited with the cleaned front-facing portrait. Anchor is the feet-center / ground contact. bbox is [x, y, w, h] in pixels of that orientation's faceoff image.","portrait":{"file":"faceoff_meadow_portrait.webp","size":[800,1440],"hero":{"anchor":[165,1150],"bbox":[35,810,260,340],"ground_y":1150,"recommended_height":340},"boss":{"anchor":[560,1150],"bbox":[328,674,459,477],"ground_y":1150,"height":477}},"landscape":{"file":"faceoff_meadow_landscape.webp","size":[2048,1280],"hero":{"anchor":[793,1139],"bbox":[633,739,320,400],"ground_y":1139,"recommended_height":400},"boss":{"anchor":[1256,1139],"bbox":[985,581,538,559],"ground_y":1139,"height":559}}},"lagoon":{"world":"lagoon","boss":"Zest","notes":"Official Zest portrait is front-facing and is composited on the right, matching the approved meadow pattern. The left side is reserved for a code-drawn hero (soft ground spot only). No friend characters are painted in. The background is the official lagoon locked_scene with any friend silhouette removed; the official boss is left in place and over-composited with the cleaned front-facing portrait. Anchor is the feet-center / ground contact. bbox is [x, y, w, h] in pixels of that orientation's faceoff image.","portrait":{"file":"faceoff_lagoon_portrait.webp","size":[800,1440],"hero":{"anchor":[240,1150],"bbox":[110,810,260,340],"ground_y":1150,"recommended_height":340},"boss":{"anchor":[560,1150],"bbox":[345,658,460,493],"ground_y":1150,"height":493}},"landscape":{"file":"faceoff_lagoon_landscape.webp","size":[2048,1280],"hero":{"anchor":[400,1122],"bbox":[240,722,320,400],"ground_y":1122,"recommended_height":400},"boss":{"anchor":[1035,1122],"bbox":[653,247,817,876],"ground_y":1122,"height":876}}},"hills":{"world":"hills","boss":"Tower","notes":"Official Tower portrait is front-facing and is composited on the right, matching the approved meadow pattern. The left side is reserved for a code-drawn hero (soft ground spot only). No friend characters are painted in. The background was rebuilt from the official hills scene renderer (bg + cooling rack only): continuous muffin-wrapper flutes and a complete rack grid, with no friend and no baked-in boss. Official front-facing Tower is composited on top at the locked-scene feet position. Anchor is the feet-center / ground contact. bbox is [x, y, w, h] in pixels of that orientation's faceoff image. Official front-facing cutout was re-composited with the contact-shadow-only alpha (ink smile / eyes / cheeks stay opaque).","portrait":{"file":"faceoff_hills_portrait.webp","size":[800,1440],"hero":{"anchor":[229,1150],"bbox":[99,810,260,340],"ground_y":1150,"recommended_height":340},"boss":{"anchor":[560,1150],"bbox":[331,727,460,424],"ground_y":1150,"height":424}},"landscape":{"file":"faceoff_hills_landscape.webp","size":[2048,1280],"hero":{"anchor":[691,1139],"bbox":[531,739,320,400],"ground_y":1139,"recommended_height":400},"boss":{"anchor":[1241,1139],"bbox":[860,436,763,704],"ground_y":1139,"height":704}}},"woods":{"world":"woods","boss":"Knot","notes":"Official Knot portrait is front-facing and is composited on the right, matching the approved meadow pattern. The left side is reserved for a code-drawn hero (soft ground spot only). No friend characters are painted in. The background was rebuilt from the official woods scene renderer (background only): complete pretzel-gate and clearing, with no friend and no baked-in boss. Official front-facing Knot is composited on top at the locked-scene feet position, using a contact-shadow-only cutout so the ink smile stays opaque. Anchor is the feet-center / ground contact. bbox is [x, y, w, h] in pixels of that orientation's faceoff image.","portrait":{"file":"faceoff_woods_portrait.webp","size":[800,1440],"hero":{"anchor":[173,1150],"bbox":[43,810,260,340],"ground_y":1150,"recommended_height":340},"boss":{"anchor":[560,1150],"bbox":[331,715,460,436],"ground_y":1150,"height":436}},"landscape":{"file":"faceoff_woods_landscape.webp","size":[2048,1280],"hero":{"anchor":[652,1159],"bbox":[492,759,320,400],"ground_y":1159,"recommended_height":400},"boss":{"anchor":[1266,1159],"bbox":[903,469,729,691],"ground_y":1159,"height":691}}},"peaks":{"world":"peaks","boss":"Flapjack","notes":"Official Flapjack portrait is front-facing and is composited on the right, matching the approved meadow pattern. The left side is reserved for a code-drawn hero (soft ground spot only). No friend characters are painted in. The background is the official peaks locked_scene with any friend silhouette removed; the official boss is left in place and over-composited with the cleaned front-facing portrait. Anchor is the feet-center / ground contact. bbox is [x, y, w, h] in pixels of that orientation's faceoff image. Official front-facing cutout was re-composited with the contact-shadow-only alpha (ink smile / eyes / cheeks stay opaque).","portrait":{"file":"faceoff_peaks_portrait.webp","size":[800,1440],"hero":{"anchor":[298,1150],"bbox":[168,810,260,340],"ground_y":1150,"recommended_height":340},"boss":{"anchor":[560,1150],"bbox":[320,755,460,396],"ground_y":1150,"height":396}},"landscape":{"file":"faceoff_peaks_landscape.webp","size":[2048,1280],"hero":{"anchor":[768,1140],"bbox":[608,740,320,400],"ground_y":1140,"recommended_height":400},"boss":{"anchor":[1152,1140],"bbox":[799,559,676,582],"ground_y":1140,"height":582}}},"bay":{"world":"bay","boss":"Rindy","notes":"Official Rindy portrait is front-facing and is composited on the right, matching the approved meadow pattern. The left side is reserved for a code-drawn hero (soft ground spot only). No friend characters are painted in. The background is the official bay locked_scene with any friend silhouette removed; the official boss is left in place and over-composited with the cleaned front-facing portrait. Anchor is the feet-center / ground contact. bbox is [x, y, w, h] in pixels of that orientation's faceoff image.","portrait":{"file":"faceoff_bay_portrait.webp","size":[800,1440],"hero":{"anchor":[202,1150],"bbox":[72,810,260,340],"ground_y":1150,"recommended_height":340},"boss":{"anchor":[560,1150],"bbox":[331,674,460,477],"ground_y":1150,"height":477}},"landscape":{"file":"faceoff_bay_landscape.webp","size":[2048,1280],"hero":{"anchor":[720,1164],"bbox":[560,764,320,400],"ground_y":1164,"recommended_height":400},"boss":{"anchor":[1229,1164],"bbox":[903,487,654,678],"ground_y":1164,"height":678}}},"caves":{"world":"caves","boss":"Crumble","notes":"Official Crumble portrait is front-facing and is composited on the right, matching the approved meadow pattern. The left side is reserved for a code-drawn hero (soft ground spot only). No friend characters are painted in. The background is the official caves locked_scene with any friend silhouette removed; the official boss is left in place and over-composited with the cleaned front-facing portrait. Anchor is the feet-center / ground contact. bbox is [x, y, w, h] in pixels of that orientation's faceoff image.","portrait":{"file":"faceoff_caves_portrait.webp","size":[800,1440],"hero":{"anchor":[279,1150],"bbox":[149,810,260,340],"ground_y":1150,"recommended_height":340},"boss":{"anchor":[552,1150],"bbox":[320,722,467,429],"ground_y":1150,"height":429}},"landscape":{"file":"faceoff_caves_landscape.webp","size":[2048,1280],"hero":{"anchor":[784,1037],"bbox":[624,637,320,400],"ground_y":1037,"recommended_height":400},"boss":{"anchor":[1084,1037],"bbox":[809,529,555,509],"ground_y":1037,"height":509}}}};
  function orient() {
    try { return document.documentElement.getAttribute('data-stage') === 'landscape' ? 'landscape' : 'portrait'; }
    catch (e) { return 'portrait'; }
  }
  function region(id, o) {
    o = o || orient();
    var pack = REGIONS[o];
    return pack && pack.regions && pack.regions[id] ? pack.regions[id] : null;
  }
  function regionPct(id, o) {
    o = o || orient();
    var pack = REGIONS[o], r = region(id, o);
    if (!pack || !r) return null;
    var W = pack.size[0], H = pack.size[1];
    return {
      x: r.center[0] / W * 100,
      y: r.center[1] / H * 100,
      l: r.bbox[0] / W * 100,
      t: r.bbox[1] / H * 100,
      w: r.bbox[2] / W * 100,
      h: r.bbox[3] / H * 100
    };
  }
  function zoomScale(id, o) {
    var p = regionPct(id, o);
    if (!p || !p.w || !p.h) return 2;
    return Math.min(100 / p.w, 100 / p.h) * 0.9;
  }
  function face(id, o) {
    o = o || orient();
    var a = ANCHORS[id];
    return a && a[o] ? a[o] : null;
  }
  function cloud(id, o) {
    o = o || orient();
    return CLOUDS[o] && CLOUDS[o][id] ? CLOUDS[o][id] : null;
  }
  function cloudPct(id, o) {
    var c = cloud(id, o);
    if (!c || !c.pct) return null;
    return { l: c.pct.left, t: c.pct.top, w: c.pct.width, h: c.pct.height };
  }
  function cloudURL(id, o) {
    o = o || orient();
    return ROOT + 'overview/clouds/' + o + '/cloud_' + id + '-2x.webp';
  }
  A.StoryArt = {
    style: 'A',
    regions: REGIONS,
    clouds: CLOUDS,
    anchors: ANCHORS,
    orient: orient,
    overviewURL: function (o) { return ROOT + 'overview/overview_' + (o || orient()) + '.webp'; },
    silhouetteURL: function (id) { return ROOT + 'worlds/' + id + '/silhouette_' + id + '.png'; },
    faceoffURL: function (id, o) { return ROOT + 'worlds/' + id + '/faceoff_' + id + '_' + (o || orient()) + '.webp'; },
    region: region,
    regionPct: regionPct,
    zoomScale: zoomScale,
    cloud: cloud,
    cloudPct: cloudPct,
    cloudURL: cloudURL,
    face: face
  };
})(window.Arcade);
