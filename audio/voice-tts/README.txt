Built-in voice clips for Blob Arcade (computer-generated, NOT a recorded human voice).
  Engine: Kokoro TTS v1.0 (Apache-2.0), run offline with kokoro-onnx.  Voice: af_heart (speed 1.0, slowed to 0.9 with rubberband).
  956 line clips + 1394 whole-sentence clips (Mochi Munch v3, Blob Baseball umpire lines and questions, Blob Room + blob friend lines).
  Mono MP3, 24 kHz, 48 kbps, loudness-normalized to -18 LUFS.
  <id>.mp3            one clip per voice line (same IDs as js/core/voice-lines.js / RECORDING_SCRIPT.md)
  phrases/<a.b>.mp3   whole composed sentences, e.g. phrases/munch_rule_make.num_7.mp3 = "Munch the ones that make seven!"
  manifest.js         list of the clips (the games only request files listed here)
  index.json          the exact text spoken for each clip

These are the lowest-priority recordings: any line recorded in the grown-up area, or any file you put in
audio/voice/, plays instead. Don't put your own recordings in this folder - use audio/voice/.
Regenerate with tools/generate-tts.py (see README.md).
