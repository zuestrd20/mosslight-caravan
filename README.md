# 苔光行囊 · Mosslight Caravan

Original Traditional Chinese backpack-merge auto-battle roguelite. Play at https://zuestrd20.github.io/mosslight-caravan/ .

## Play
- Choose ranger, toxin alchemist, or guardian; enter any repeatable seed.
- Buy weapons, arrange a 6×5 bag, rotate shapes, and merge equal items up to tier III.
- Build directional quiver chains, adjacent mushroom poison, or shield/weapon defenses.
- Survive nine encounters, three bosses, and choose a blessing after each victory.
- Mouse drag/drop, click-to-place, keyboard arrows/R/Escape, and touch supported.
- Combat runs automatically, with pause and 1×/2×/4× speed. Local saves resume at camp if interrupted mid-combat.
- Local journal tracks class victories; no accounts, ads, analytics, or payments.

## Run and test
Serve this directory using any static HTTP server, for example `python3 -m http.server 8080`.
Node 20+ is enough for tests, with no dependencies: `npm test` and `npm run check`.

`engine.js` contains seeded state transitions and deterministic fixed-step combat; `app.js` is the responsive DOM UI; `assets/` contains original SVG artwork. No unbounded canvas render cache, no WebGL, one managed animation frame loop, bounded logs and effects.

## Art and licensing
All SVG illustrations and icons are original, created specifically for this game. No third-party game IP, copied screenshot graphics, downloaded GLB models, external font requests, or tracking scripts are used. See assets/README.md for the artwork manifest. Code and art are included in this repository for the game; no third-party redistribution license is claimed.

## Save behavior
Saves are validated for shape, collision, identity, phases, economy, and blessing constraints. Malformed saves are rejected. Combat saves safely return to the same stage's pre-battle camp instead of trusting serialized combat runtime. Browser-local records do not sync between devices. Clearing browser data removes progress.
