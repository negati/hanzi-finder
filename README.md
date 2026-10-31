# Character Finder V1.4

V1.2 interface restored, using V1.3's 3,500-character local dictionary.

## Quick setup (recommended)
1. From your existing `hanzi-v1.3/data` folder, copy `characters.json` into this project's `data` folder.
2. Open a terminal in this folder and run `python -m http.server 8000`.
3. Open http://localhost:8000 in a browser. If port 8000 is occupied by V1.3, stop the old server (Ctrl+C) first.

Alternatively, run `python build.py` in this folder to rebuild the dataset. The script downloads source files on its first run.

## What changed
- V1.2 dark two-panel layout and stroke-count grouping, with scrolling components.
- V1.3 3,500 common simplified Hanzi, readings, definitions, and component data.
- Tone-marked Pinyin display, with numbered and accented Pinyin search.
- All-selected-components matching, related radical variants, and dynamic disabling.

## Limitations
- Component matching uses recursive decompositions and radical-family approximations. Some matches can be overly broad.
- Components absent from the stroke-count catalog aren't shown; the catalog can be expanded after validating stroke counts.
- Character rank comes from the common-character source list and isn't independently verified as corpus frequency.
- The build script downloads third-party data; preserve attribution and review licenses before public redistribution.

## Sources
- Common 3,500-character list: https://gist.github.com/jjgod/1432945
- Make Me a Hanzi: https://github.com/skishore/makemeahanzi
- CC-CEDICT: https://cc-cedict.org/
