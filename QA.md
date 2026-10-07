# Verification report — 2026-10-07

## Automated rules and UI-state regression tests

`npm test`: **37 / 37 passed** (23 engine + 14 UI-state tests).
`npm run check`: JavaScript syntax checks passed.

Coverage includes:
- All item rotations, boundaries, overlap rejection, and atomic invalid actions
- Buy/sell/reroll/merge resource changes, tier cap, full-bag auto-merge, seeded shop behavior
- Directional quiver links, mushroom adjacency, shield adjacency
- Frame-rate-independent fixed-step combat, poison, healing, shields, damage, and phase guards
- All three classes completing all nine stages through legal engine actions
- Starter-only no-investment strategies losing
- Victory rewards, three-choice blessings, boss transitions
- Malformed/corrupt/overlapping/prototype-key saves, unique run IDs, terminal reloads
- Escape/outside/invalid-rotation drag cancellation, multi-pointer guard, merge/sell state
- Pause/menu combat freeze, one animation-frame loop, save-failure warnings, pause HUD

These automated engine and VM/DOM-state tests are separate from the live browser play below. They are not a claim of three manually played campaigns.

## Actual public browser play

Public URL: https://zuestrd20.github.io/mosslight-caravan/

### Desktop, approximately 1165 CSS px wide
- Completed a full ranger campaign using visible UI controls only, seed `test-seed`.
- All nine encounters and three bosses cleared; result: **9/9, 28 merges, 8 blessings**.
- Used legal shop purchases, manual/keyboard merge controls, click-to-place directional rearrangement, and actual timed combat. Repetitive visible-control clicks were batched by the browser tool; no hidden game-state edits or direct battle simulation were used.
- Verified purchase, merge, rejected overlapping rotation, arrow-key movement, outside-grid drag cancellation, valid drag relocation, pause/resume, speed changes, camp save, and interrupted-combat reload.
- Reloaded at stage nine without losing the bag; completed final boss on the polished build.
- Reloaded the completed run and confirmed the local journal still counted exactly one victory and one ranger unlock.

### Narrow layouts
- Verified actual rendered CSS widths **388 and 323 px**, obtained by narrowing the cloud Chromium window and using browser zoom. Both had document scroll width equal to viewport width, with no horizontal overflow.
- At 388 px, started the toxin class, purchased and merged a poison bottle, moved/rotated it, sold a dagger, and won an actual poison encounter; the three-choice reward dialog remained usable.
- At 323 px, verified cancel-new-run, a genuine no-investment ranger defeat (38.3 simulation seconds), same-seed retry, purchase/merge, and save.
- Visible hero/enemy/brand/shop images reported loaded successfully. All three chapter backdrops and boss artwork appeared during play.

## Implementation and limits

- Original self-authored SVG art; no downloaded GLB, external game graphics, external fonts, ads, analytics, accounts, or purchases.
- One managed animation loop; bounded combat logs (80), journal log (40), floating effects (12), and stored completion IDs (200). No canvas/WebGL render cache.
- Browser-local saves only. Interrupted combat resumes at the same stage's camp by design; this is explained in the guide and resume message.
- Physical iOS/Android touch hardware was not available. The shared pointer handler, click-to-place alternative, cancellation, and multi-pointer guard were tested; device-specific touch behavior is not claimed as manually verified.
- Only ranger received a full live-browser campaign playthrough. All three full campaigns passed automated legal-action simulation. Toxin received a narrow live encounter test; guardian mechanics and victory were verified by engine tests.
- Browser-extension metadata errors appeared in the cloud tooling log; no game-script error was observed in the tested flows.

## Publication

The repository was created through the cloud browser as requested. GitHub Pages publishes from `main` at repository root over HTTPS. Core polished build: `9e9ba9e34ac68bcb72a6f63fab3d7fcfa415ea36`; this report is a documentation-only follow-up.
