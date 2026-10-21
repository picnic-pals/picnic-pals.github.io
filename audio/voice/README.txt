Voice files go here, one file per line, named <line id>.<ext>  (ext: m4a, mp3, wav, webm or ogg)
e.g.  munch_rule_make.m4a   num_7.m4a   fb_yum.m4a
The full list of ids and words is in ../../RECORDING_SCRIPT.md (or .pdf).

After adding or removing files, update the list the games read:
    node tools/make-voice-manifest.js        (or)   python3 tools/make_voice_manifest.py
(run from the arcade folder). Files not in manifest.js are ignored unless you press
"Scan audio/voice folder" in the grown-up area's Voice recorder.

Files here are "your voice" and always play instead of the built-in clips in ../voice-tts/.
Recordings made in the in-app recorder are stored in the browser (IndexedDB), not here.
Use Export (.zip) in the recorder to get them as files.
