# Wheelcast design

This records the existing implementation after the three targeted fixes. The page design, artwork and CSS were preserved. Wheelcast gives streamers five OBS browser sources and a program monitor in a broadcast control-room layout: dark navy surfaces, copper wheel artwork, yellow actions and red on-air lights.

## Colors

The canonical declarations are inline in `index.html:15` and `overlay.html:15`.

| Token | Settings page | Role |
|---|---|---|
| `--ink` | `#10192B` | Page background; dark text on light controls |
| `--desk` | `#162236` | Fields and source buttons |
| `--rack` | `#1E2D46` | Declared in the existing palette, currently unused |
| `--seam` | `#2C3F60` | Separators and control borders |
| `--paper` | `#F3F6FA` | Primary text and selected segmented buttons |
| `--dim` | `#9AABC2` | Supporting text and inactive labels |
| `--signal` | `#FFD23F` | Copy buttons, links and focus outline |
| `--copper` | `#C8743A` | Wheel mark, numbered steps and overlay accents |
| `--tally` | `#E5383B` | On-air source indicators and API failure lamp |
| `--go` | `#3FD07A` | Running-wheel and enabled monitor-sound indicators |

Overlay panels use `--ink`, `--ink2: #1B2A44`, `--ink3: #25395A`, `--fg: var(--paper)`, `--fg2: #B9C6D6` and `--steel: #8FA3B8`. `body.daylight` replaces the three panel colors with `#F3F6FA`, `#E2E8F0`, `#CBD5E1`, foregrounds with `#10192B`/`#41506A`, and steel with `#5B6F88`. `body.copper` uses `#24130B`, `#3A2214`, `#52311D`, foregrounds `#FFF4E8`/`#E2C4A8`, and steel `#C9A27F`. These theme classes affect the overlay; the settings page remains navy.

The program-monitor bezel is `#05080e`, around a black screen. The demo stage uses the existing radial background and embedded SVG noise. No new palette was introduced. Measured contrast coverage and exclusions are in README.md.

## Typography

Both pages request Barlow and Barlow Condensed through Google Fonts (`fonts.googleapis.com` serves CSS; `fonts.gstatic.com` serves fonts), with `display=swap`. Fonts remain an external dependency.

The settings page's `--body` stack is `"Barlow","Bahnschrift",system-ui,sans-serif`; `--cond` is `"Barlow Condensed","Bahnschrift Condensed","Bahnschrift","Arial Narrow","DejaVu Sans Condensed",sans-serif`. The overlay's condensed stack additionally includes Roboto Condensed; its body stack is `"Barlow",system-ui,sans-serif`.

The body is 400 17px/1.55. The existing condensed hierarchy is h1 800 46px/1.02 with −0.005em tracking, h2 800 32px/1.1, h3 800 26px/1.05, and fine-print headings 700 19px/1.2. The h1's 46px declaration follows and overrides the earlier 38px phone declaration. The italic wordmark requests 900 34px/1. Inputs are 500 17px; field labels and segmented controls are 16px; secondary UI uses 13–15px. OBS links use a 13px monospace stack. Introductory copy is capped at 38ch and row descriptions at 60ch.

Overlay type is intentionally larger at its native broadcast dimensions: 56px run headlines, 86px RPM, 110px block numbers, and 40px result stamps. `fitText()` reduces certain single-line headlines to fit; `.num` enables tabular digits. A scaled 1920×1080 iframe presents these graphics inside the monitor.

The Google Fonts requests and CSS use different weight sets by family/page; not every requested CSS weight is explicitly downloaded, so browser synthesis/fallback remains possible. The probe reported six computed weights and ten sizes on the settings page. Intended webfont rendering was not verified; browser screenshots used fallbacks.

## Layout

`index.html` uses `.wrap` with a 1240px maximum width, auto margins and 28px horizontal padding. `.mast` aligns the wordmark and real-wheel status. `.room` is a 330px control column plus a flexible monitor column, separated by 34px; `.desk` has a 16px gap. Related controls use 6–10px spacing, while sections use larger gaps and separators.

At 980px and below, `.room` stacks lead, monitor, then desk. Source rows become one column, OBS instructions become two columns and the fine-print pair becomes one column. At 700px and below, the five monitor source controls become a two-column grid. At 600px and below, the masthead wraps status beneath the wordmark. The screen maintains 16:9 and scales the fixed-size iframe from its top-left corner on resize.

The full settings page was checked at 320, 390, 700, 980 and 1440px without horizontal document overflow. At 390×844 the product monitor and source toggles are visible on the first screen. The link-copy rows remain below the controls. The new font disclosure wraps inside the existing fine-print column.

`overlay.html` is a transparent, fixed-canvas OBS composition with document overflow hidden, not a responsive standalone dashboard. Each `?w=` positions the selected graphic for its documented OBS size; `--scale` controls its transform. The `all` layout positions alert and telemetry at the left, chat calls at the right, block banners centrally and ticker along the bottom.

## Elevation and shapes

Fields, segmented controls, source buttons and copy rows have 1px seam borders and 4px radii. The bezel and OBS instruction sequence use 6px radii; the screen and size chips use 2px. Lamps and wheel elements are circular. Source selection adds a red border and glowing lamp; selected segmented buttons invert to paper on ink.

The existing bezel combines a border with `0 30px 60px #0008` shadow. Broadcast overlays use shadows, diagonal clip-path cuts, skewed bands and copper/yellow edges. The toast floats above normal content at the bottom center. The probe's existing bezel-chrome and toast-transition findings are documented in README.md.

## Components and behavior

| Pattern | Source | Existing states and behavior |
|---|---|---|
| Masthead | `index.html`, `.mast`, `.live`, `live()` | Checking, running, napping and API-unavailable status; polite live region |
| Settings fields | `index.html`, `.field`, `.seg`, `.tog` | Native labeled inputs, `aria-pressed` theme/scale controls; changes regenerate live source links and remount the demo as needed |
| Program monitor | `index.html`, `mount()`, `fit()`, `send()` | Prefer srcdoc, fall back to a normal iframe; demo feed; sound off/on; source controls toggle visibility |
| Source rows | `index.html`, `SRC`, `.row`, `.link`, `.fire` | Five overlay descriptions and OBS sizes; readonly live URLs, Copy link feedback and selectable-link fallback; event buttons act on the demo monitor |
| Streak board | `overlay.html`, `renderPoll()`, `resolvePoll()`, `renderPodium()` | Open vote counts, settled result, next-round reopening and top three streaks; live storage remains per channel, demo board exists only in memory |
| Broadcast events | `overlay.html`, `showAlert()`, `showBlock()`, `renderGauge()`, `renderTicker()` | Run/nap alerts, block banners, changing telemetry and timed crawl; demo commands accepted only from parent, or self when unframed |
| Instructions and disclosure | `index.html`, `.steps`, `.fine` | Four numbered OBS steps; data/storage and Google Fonts explanations |
| Toast | `index.html`, `.toast`, `toast()` | `role="status"`, temporary copy/sound feedback; existing 0.25s transition |

Native buttons provide Enter/Space activation. The settings page declares a 3px yellow `:focus-visible` outline with 2px offset; the segmented container's clipping limits its outer ring. Reduced motion disables settings transitions and reduces overlay CSS animations to one 0.01s iteration, with transitions disabled. JavaScript particle effects were not comprehensively audited for reduced motion. README.md records what was actually exercised and what remains unverified.

## Reuse

Use the existing palette, `.wrap`, heading roles, labeled native fields and source-row patterns when extending this site. Source links continue to address `overlay.html` relative to the current host path. Keep the distinction between the labeled demo monitor and live OBS links. Preserve transparent OBS canvases, documented source dimensions, optional themes and per-channel live storage. Reuse the existing focus treatment with attention to clipping rather than introducing another control style.

Review method: pinned Better Interface guidance by Jakub Krehel (MIT) and the Impeccable documentation method by Paul Bakaus (Apache-2.0), as supplied with this assignment. This document describes Wheelcast's source; it does not reproduce the guides.
