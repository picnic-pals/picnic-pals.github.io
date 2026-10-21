/* Blob Arcade — tiny ZIP writer (store-only, no compression) and reader (stored + deflate via
   DecompressionStream when the browser has it). No libraries. Used to move voice recordings between devices. */
(function (A) {
  'use strict';
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function toU8(blob) {
    if (blob instanceof Uint8Array) return Promise.resolve(blob);
    if (blob.arrayBuffer) return blob.arrayBuffer().then(function (b) { return new Uint8Array(b); });
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(new Uint8Array(r.result)); }; r.onerror = rej; r.readAsArrayBuffer(blob); });
  }
  function dos(d) {
    return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2)),
      date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
  }
  // files: [{name, data: Blob|Uint8Array|string}] -> Promise<Blob>
  function make(files) {
    var enc = new TextEncoder();
    return Promise.all(files.map(function (f) { return typeof f.data === 'string' ? enc.encode(f.data) : toU8(f.data); })).then(function (datas) {
      var parts = [], central = [], offset = 0, t = dos(new Date());
      files.forEach(function (f, i) {
        var name = enc.encode(f.name), data = datas[i], crc = crc32(data);
        var lh = new DataView(new ArrayBuffer(30));
        lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
        lh.setUint16(10, t.time, true); lh.setUint16(12, t.date, true); lh.setUint32(14, crc, true);
        lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
        parts.push(lh.buffer, name, data);
        var ch = new DataView(new ArrayBuffer(46));
        ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
        ch.setUint16(12, t.time, true); ch.setUint16(14, t.date, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
        ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true);
        ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
        central.push(ch.buffer, name);
        offset += 30 + name.length + data.length;
      });
      var cdSize = central.reduce(function (s, b) { return s + (b.byteLength || b.length); }, 0);
      var end = new DataView(new ArrayBuffer(22));
      end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
      end.setUint32(12, cdSize, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
      return new Blob(parts.concat(central, [end.buffer]), { type: 'application/zip' });
    });
  }
  function inflate(u8) {
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('This browser cannot unzip compressed files. Re-zip without compression ("store"), or import the audio files directly.'));
    var ds = new DecompressionStream('deflate-raw');
    var stream = new Blob([u8]).stream().pipeThrough(ds);
    return new Response(stream).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  // blob -> Promise<[{name, data: Uint8Array}]>
  function read(blob) {
    return toU8(blob).then(function (u8) {
      var dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), dec = new TextDecoder(), e = -1;
      for (var i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
      if (e < 0) throw new Error('Not a zip file');
      var n = dv.getUint16(e + 10, true), p = dv.getUint32(e + 16, true), out = [];
      for (var k = 0; k < n; k++) {
        if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Bad zip directory');
        var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
        var name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
        var ds = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
        out.push({ name: name, method: method, raw: u8.subarray(ds, ds + csize) });
        p += 46 + nlen + xlen + clen;
      }
      return Promise.all(out.map(function (f) {
        if (f.method === 0) return { name: f.name, data: f.raw };
        if (f.method === 8) return inflate(f.raw).then(function (d) { return { name: f.name, data: d }; }, function (err) { return { name: f.name, error: err.message }; });
        return { name: f.name, error: 'unsupported compression' };
      }));
    });
  }
  A.Zip = { make: make, read: read, crc32: crc32 };
})(window.Arcade);
