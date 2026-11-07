# Wheelcast

**Broadcast graphics for a hamster.** Five free OBS overlays that react to Squeektoshi's wheel and the Squeekchain rounds in real time. No login, no keys, no server.

Open the site, set your Twitch channel and look, copy a link, add it to OBS as a Browser source. The settings page has a live program monitor running on demo data, with buttons to take each overlay on or off air and to fire every event.

## Overlays

| Overlay | What it does | OBS size |
|---|---|---|
| Run alert | A broadcast wedge wipes in and Squeektoshi leaps out of it the moment the wheel sensor reports he is running (`coreStatus` IDLE → SPINNING), with his live rpm and the next block. Optional nap alert. | 800 × 220 |
| Wheel telemetry | F1-style rev lights that climb from green to red with his real rpm, plus speed in m/s, distance run during your stream and the current Squeek block. | 400 × 230 |
| Block banner | A full-width banner with copper sparks whenever a settled round completes Squeek blocks, with the SQK minted and the round number. | 1920 × 1080 |
| Chat calls | Viewers type `!run` or `!nap` in Twitch chat. When the next 10-minute round settles on Sepolia, the board stamps the result (work added > 0 = he ran) and keeps everyone's streak; the top three streaks are listed. | 400 × 330 |
| Ticker | A lower third with a live tally, a crawl of wheel and chain stats, and a clock counting down to the next round. | 1920 × 60 |

`overlay.html?w=all` shows every overlay laid out for a 1920 × 1080 scene.

### Link options (`overlay.html`)

| Param | Values | Default |
|---|---|---|
| `w` | `alert`, `gauge`, `block`, `poll`, `ticker`, `all` | `all` |
| `channel` | Twitch channel name (turns on chat calls) | none |
| `theme` | `broadcast`, `copper`, `daylight` | `broadcast` |
| `scale` | 0.3 – 3 | 1 |
| `sound` | `0` to mute | on |
| `nap` | `1` to also announce naps | off |
| `secs` | how long the run alert stays, 4 – 30 | 9 |
| `demo` | `1` simulates a running hamster, chat and blocks | off |

## How it uses Squeekchain

Everything is read from Squeekchain's public API (`https://api.squeekchain.com/v1`) by the streamer's own OBS:

- `/status` every 5 seconds: `measurement.coreStatus`, `rpmMilli`, `speedMmPerSecond`, `distanceMm`; `builder.projected.blockHeight` and `blockProgress`.
- `/settlements?range=24h` every 30 seconds: new entries in `recentSettlements` trigger block banners and settle chat calls (`workAdded`, `completedBlockCount`, `lastCompletedBlock`, `sqkMintedBaseUnits`, `settledThroughRound`); `summary` and `buckets` feed the ticker.

Twitch chat is read anonymously over Twitch's public IRC WebSocket (read-only `justinfan` login). Wheelcast never posts and never asks for a token. Prediction streaks are stored in the OBS browser's localStorage, per channel. Sounds are synthesised in the browser, so there are no audio files.

The pages load the Barlow typeface (including Barlow Condensed) from Google Fonts (fonts.googleapis.com and fonts.gstatic.com).

Squeektoshi's wheel time is never forced or encouraged; naps are part of the show.

## Files

- `index.html`: the settings page and program monitor
- `overlay.html`: all five overlays (one file, picked with `?w=`)
- `assets/`: the hamster and wheel artwork (original, made with Google Gemini)

## Build and preview

Use Node.js 22 or newer to rebuild. This is a plain HTML/CSS/JavaScript site with no package dependencies, package manifest or lockfile; no package installation is needed.

```sh
node build.mjs
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080/`. Stop the preview with Ctrl+C. Run `node build.mjs` again after editing either page or the artwork. The production build checks inline JavaScript syntax and copies both pages and `assets/` unchanged into `dist/`. Local asset paths remain relative, including when hosted under a subpath. The existing Google Fonts, Squeekchain and Twitch connections still require internet access. Serve `dist/` as static files; no server-side application is needed.

## Targeted fixes and validation

Validated on 2026-11-07. The task's named `.imd-findings.json` was not present; the three findings quoted in the assignment were used. The only page-source changes are the two overlay guards and the requested font disclosure. Existing CSS, other copy and interactions are preserved. `DESIGN.md` documents that existing implementation.

| Finding | Implementation | Actual validation |
|---|---|---|
| Demo streak storage | `overlay.html:464`: `BKEY` is `null` in demo mode; initial load and `saveBoard()` skip storage. | Standalone demos with and without a channel, the framed demo and the settings page's srcdoc monitor made zero storage accesses. Demo settlements updated their in-memory podium, left seeded live streaks intact and did not survive reload. |
| Message boundary | `overlay.html:530`: require demo mode and `e.source === window.parent`. An unframed page's parent is itself. | Real parent messages exercised all six commands in demo mode; self messages worked in an unframed demo. Sibling-frame messages and a framed demo's own messages did nothing. Standalone and framed live overlays ignored every test command, including parent messages. A simulated real Twitch vote and advancing API settlement still persisted the live streak. |
| Font disclosure | `index.html:189` and the Google Fonts paragraph above. | Confirmed both domains and Barlow are named; inspected the added paragraph at 390px without clipping or overflow. |

Production build: `node build.mjs` passed. Extracted inline scripts also passed `node --check`. The export was served under `/preview/` for browser validation, with both HTML pages and artwork matching source bytes. No protected configuration, dependencies, ignore files or Git metadata were changed.

Interaction validation used a bounded foreground Playwright/Chromium script in disposable `test/scratch/`, serving the export locally and closing its server and browser at completion. **Nine groups passed, zero uncaught page errors:** demo storage with/without a channel; framed demo sender checks; standalone live sender checks; framed live sender checks; legitimate live streak persistence; settings controls, all event buttons, theme/scale/channel options, clipboard and sound toggles; responsive layout/focus/reduced motion; and API-error/clipboard-denied feedback. The font, API and Twitch responses in these interaction tests were controlled fixtures, not evidence of live service availability. No audio output or OBS application session was checked.

Typecheck: TypeScript 5.9.3 was installed only in disposable scratch space. Extracted scripts from the original and revised pages were checked with `tsc --noEmit --allowJs --checkJs --target ES2022 --lib DOM,DOM.Iterable,ES2022`. Both reported **30 existing diagnostics, exit 2, with no new diagnostics** after normalizing source positions. These primarily concern untyped DOM/event access, browser-specific window properties and JavaScript coercions. This is not a clean typecheck; converting the existing scripts to typed code is outside the three requested fixes. No checker dependency is shipped.

Better Interface review used the pinned guide's six domains, with the following coverage:

| Domain | Coverage and result |
|---|---|
| Accessibility | Native controls, labels and `aria-pressed` reviewed; keyboard activation, computed focus styles, clipboard-denied recovery and reduced motion exercised. The existing segmented container can clip its button's outer focus outline (`index.html:48`); full focus visibility and assistive technology behavior are not certified. |
| Layout | Chromium at 320, 390, 700, 980 and 1440px; no document overflow. Probe also found no overlapping or clipped text at 320/390/1440. Inspected phone/desktop screenshots. At 390×844 the product monitor and source on/off controls are on the first screen; channel settings and Copy link actions remain further down, as before. |
| Writing | Checked the added privacy sentence against the existing font URLs and retained all surrounding copy. Existing action labels, demo labeling and error feedback reviewed. |
| Typography | Source roles and rendered fallback wrapping reviewed. Existing scale has ten computed sizes and six weights (`index.html:22–119`), above the probe's limits; preserved under the exact-scope instruction. Google Fonts did not successfully load in the probe browser, so the intended font rendering was not verified. |
| Colors | Existing tokens retained. Probe's measured solid-background text passed 4.5:1, or 3:1 for large text; six text boxes over images/gradients were unmeasured. This is not a full contrast audit of every overlay/theme. |
| UI | Monitor source toggles, all test-event controls, theme remounting, link generation/copy, sound-control state and reduced-motion behavior checked. Existing bezel border plus shadow and implicit `transition: all` on the toast were preserved (`index.html:57`, `index.html:111`). |

The pinned probe ran successfully before the final production build:

```sh
IMD_PLAYWRIGHT=/opt/imd-tools/playwright-mcp/node_modules/playwright/index.mjs PLAYWRIGHT_BROWSERS_PATH=/opt/imd-tools/ms-playwright node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste
```

Result: **11/16 checks passed**. Render, layout, targets, contrast, casing, tracking, eyebrows, glyphs, slogans, repetition and copy budget passed. Existing type sizes, type weights, bezel chrome, toast motion and share metadata failed. `index.html:6–12` has a title and description but lacks a favicon, `og:title` and `og:image`. These pre-existing acceptance/design gaps were left unchanged because this task explicitly requires fixing only the three listed findings. The requested fixes introduced no style changes.

Limitations: the browser connector returned `Transport closed`; local Playwright supplied the rendered evidence instead. An additional browser check without fixtures confirmed `net::ERR_EMPTY_RESPONSE` for fonts.googleapis.com and api.squeekchain.com, an empty loaded-font set, and the existing API-unavailable message. Live Squeekchain/Twitch operation, Google Fonts availability, WebKit, a physical phone, screen readers, native 200% zoom, RTL, every focus state and full accessibility compliance were not verified. Sound control state was checked, not audible playback. Temporary tests, screenshots and checker packages are removed with `test/scratch/` before submission.

## Author

Made by serkan ([@serkankels](https://x.com/serkankels) on X).

## License

MIT
