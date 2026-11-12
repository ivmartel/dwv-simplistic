# AGENTS.md

Guidance for coding agents working in this repository.

## Project

dwv-simplistic is a simple medical image viewer built on
[DWV](https://github.com/ivmartel/dwv) (DICOM Web Viewer). It ships a single
custom element, `<dwv-simple>`, bundled as an ES module
(`dist/dwvsimplistic.min.js`). Plain JavaScript (ES modules, no framework,
no TypeScript sources), browser only. Licensed GPL-3.0; not certified for
diagnostic use.

## Commands

Package manager is Yarn 4 (via Corepack, `packageManager` in `package.json`).

```sh
yarn install          # install deps (CI uses --immutable)
yarn run start        # webpack dev server on localhost:8080 with live reload
yarn run lint         # eslint with jsdoc rules (config/eslint.config-full.js)
yarn run test         # vitest unit tests (single run)
yarn run test-ci      # tests + v8 coverage report in build/coverage/
yarn run build        # library bundle into dist/
yarn run build-demo   # full demo site into build/demo/
```

CI ([.github/workflows/nodejs-ci.yml](.github/workflows/nodejs-ci.yml))
has a `build` job (`lint`, `test-ci` then `build-demo`, all must pass) and a
`deploy` job that pushes the demo to `gh-pages` (main and release tags
only). Verify UI changes manually with `yarn run start` (load DICOM via drag and drop or `?input=<url>` in the
page URL).

## Tests

- [Vitest](https://vitest.dev/) with the `jsdom` environment
  ([vitest.config.js](vitest.config.js)); `vite` is a required peer dependency.
- Tests live in `tests/`, mirroring `src/` (e.g. `src/lib/toolbar.js` ->
  `tests/lib/toolbar.test.js`), named `*.test.js`. They are linted like sources.
- Import `describe`/`test`/`expect` explicitly from `vitest` (no globals).
- `dwv` imports work in tests; prefer testing pure helpers and `DwvAppService`
  logic over full rendering (no canvas in jsdom).
- Coverage: v8 provider over `src/**/*.js`, reports (text, html, lcov) in the
  git-ignored `build/coverage/` folder; open `build/coverage/index.html` for
  details. No thresholds are enforced.
- Add or update tests with behaviour changes.

## Layout

```
src/
  index.js            public exports: startApp, DwvComponent
  dwv-component.js    <dwv-simple> custom element: reads attributes, builds the
                      shadow DOM (header/content/footer), injects CSS, calls startApp
  applauncher.js      startApp(uid, options, rootDoc): wires service, GUI, dropbox
  appgui.js           Gui: owns Toolbar + RightPanel, progress bar, div id helpers
  lib/
    dwvAppService.js  DwvAppService (EventTarget): the only wrapper around
                      dwv's App
    annotationService.js
                      AnnotationService: annotation logic and state store on
                      top of DwvAppService, based on dwv
                      dev/viewer/src/annotationService.js (keep in sync)
    quantification.js annotation quantification groups (labels, values
                      formatting), based on dwv
                      dev/viewer/src/quantification.js
    overlays.js       dwv overlay config
    toolbar.js        tools, shapes, WL presets, reset/orientation/fullscreen/tags
    rightPanel.js     side panel hosting annotations
    annotationComponent.js
                      AnnotationComponent: annotation list renderer of the
                      AnnotationService state, based on dwv
                      dev/viewer/src/annotationComponent.js (keep in sync)
    quantificationUI.js
                      annotation quantification rendering, based on dwv
                      dev/viewer/src/quantificationUI.js
    dropboxLoader.js  drag and drop / file input loader
    modal.js          modal dialog
    snackbar.js       transient message (annotation service errors)
    tagsService.js    TagsService: DICOM tags logic and state store
                      (instance numbers, meta flattening), same design
                      as AnnotationService
    tagsComponent.js  TagsComponent: DICOM tags modal renderer of the
                      TagsService state (instance slider and tags table)
    icons.js          inline SVG icons and button helpers
  theme/              light/dark/blue/pink + common CSS (Material 3 color roles,
                      see src/theme/readme.md)
  dwv-component.css   component styles
tests/                vitest unit tests, mirrors src/
demo/                 demo index.html, PWA manifest, service worker, assets
config/               webpack (common/dev/prod) and full eslint config
resources/scripts/    outdated Conquest lua script
dist/                 built library bundle (see below)
build/                demo site (build/demo/) and coverage (build/coverage/)
```

## Architecture notes

- Data flow: `DwvComponent` -> `startApp` -> `DwvAppService` + `Gui` + `DropboxLoader`.
  GUI classes never touch the dwv `App` directly; they call `DwvAppService`
  methods and listen to its `CustomEvent`s (`loadprogress`, `dataloaded`,
  `dataready`, `presetnames`, `ismanualpreset`, `dataadd`, `dataremove`,
  `drawlayeradd`, `annotationadd|update|remove|select`). Event payloads live in `event.detail`.
  Add new app-level interactions (loading, tools, layout) to `DwvAppService`
  and expose them the same way.
- Exception: annotations mirror the dwv viewer (`dev/viewer/src`).
  `AnnotationService` (`src/lib/annotationService.js`, no DOM access)
  works on dwv objects itself, through the controllers `DwvAppService`
  exposes like the dwv viewer `DwvAppService` (`getDataController`,
  `getStageController`,
  `getUndoController`, `createAnnotationData`,
  `addAndRenderAnnotationData`). It uses `DrawController`, draw layers and
  `DicomWriter` directly, listens to `annotationgroupeditablechange` on
  the annotation group and exposes an immutable state through the external
  store contract (`subscribe` / `getSnapshot`). `AnnotationComponent`
  (`src/lib/annotationComponent.js`) only renders that state and calls the
  service actions. Both are created by `RightPanel`. Keep that split to
  ease syncing with dwv.
- Everything renders inside a shadow root. Look elements up through
  `rootDocument` (`dwvAppService.getOptions().rootDocument`), never `document`
  directly. Several components can coexist on a page, so all element ids are
  suffixed with the app uid (`layerGroup-<uid>`, `header-<uid>`, ...); use the
  helpers in `appgui.js` or the same pattern.
- Supported viewer tools: `Scroll`, `ZoomAndPan`, `WindowLevel`, `Draw`
  (shapes: Ruler, Arrow, Rectangle, Circle, Ellipse, Protractor, Roi).
  Matching against user input is case insensitive.
- CSS is imported as strings via `css-loader` and injected in a `<style>`
  element. Themes use CSS custom properties; when two themes are given they
  are switched with `prefers-color-scheme`.
- The bundle is self-contained (dwv, konva, jszip and magic-wand are bundled).
  webpack emits the dwv web workers (`*.worker.min.js`) next to it, and they
  are loaded relative to the bundle URL.
- `dwv` is pinned to an exact version in `package.json`; check its API
  ([dwv repo](https://github.com/ivmartel/dwv)) before changing calls.
- Public API documentation of `<dwv-simple>` attributes is the JSDoc on
  `DwvComponent`; keep it in sync when adding or changing attributes.
- `doc/design/`: component design specs, framework agnostic. Read the spec
  before changing a component and keep it up to date with behaviour
  or style changes.

## dwv linked files

Some files are adapted from the dwv repository viewer
([dwv/dev/viewer](https://github.com/ivmartel/dwv/tree/develop/dev/viewer),
`dev/pacs` up to v0.37.0-beta.24)
and must be kept in sync with it:

| file | dwv source |
| --- | --- |
| `src/lib/annotationService.js` | `dev/viewer/src/annotationService.js` |
| `src/lib/annotationComponent.js` | `dev/viewer/src/annotationComponent.js` |
| `src/lib/quantification.js` | `dev/viewer/src/quantification.js` |
| `src/lib/quantificationUI.js` | `dev/viewer/src/quantificationUI.js` |

- When changing them, check the dwv source for the version pinned in
  `package.json` and keep structure, naming and logic close to it so
  upstream changes can be ported as diffs. Keep local adaptations (shadow
  root lookups, uid-suffixed ids, `dwv` package imports, icons, theme
  classes) minimal and easy to spot. The local `DwvAppService` is its
  own implementation and is not synced with the dwv viewer one.
  Up to v0.37.0-beta.24 the dwv sources had other names (`annot.service.js`,
  `viewer.ui.annot.js`, `viewer.ui.quantification.js`, `viewer.service.js`
  in `dev/pacs`).
- When bumping `dwv`, diff these dwv sources between the old and new
  versions and port relevant changes.
- Fixes that are not specific to this project belong upstream in dwv too;
  mention it to the user.

## Code style

Enforced by eslint (`eslint.config.js` + `config/eslint.config-full.js`):

- 2-space indent, single quotes, semicolons, max line length 80, 1TBS braces,
  `===` only, always curly braces, `const`/`let` (no `var`), no space before
  named function parens. Unused args must be prefixed with `_`.
- JSDoc is required on functions, classes and methods (typescript flavor):
  descriptions are complete sentences ending with a period, one blank line
  between description and tags, `@param`/`@returns` with types. Type-only
  imports use `@import` in a JSDoc block (e.g. `@import {DwvAppService} from './dwvAppService.js';`).
- Use private class fields/methods (`#field`) for internal state, as in the
  existing classes. Prefer `typeof x !== 'undefined'` checks, matching the
  surrounding code.
- Run `yarn run lint` and `yarn run test` before finishing.

## Build output and releases

- `dist/` is git-ignored and not tracked. It is only needed for npm publish:
  the `prepack` script runs `yarn run build`, and `.npmignore` keeps `dist/`
  (plus `package.json`, `license.txt`, `readme.md`) in the package. Never
  commit it.
- `yarn run build-demo` (`config/webpack.demo.js`, extends the prod config)
  writes the demo site to `build/demo/`: bundle in `build/demo/dist/`,
  generated `index.html`, the other `demo/` files, `license.txt` and
  `readme.md`. `build/` is git-ignored too.
- Pushes to `main` deploy `build/demo/` to `gh-pages` (`demo/trunk`); non-beta
  tags deploy to `demo/stable`. html-webpack-plugin injects the bundle script
  into `demo/index.html`. The demo build also replaces the
  `<!-- register-sw ... -->` comment with the service worker script (left out in
  dev); keep that marker intact. Keep the `urlsToCache` list in
  `demo/service-worker.js` in sync with the files in `build/demo/`.

## Dependencies

Dependabot opens weekly npm bump PRs; patch updates are auto-merged once CI
passes, minor/major ones need manual review (`.github/dependabot.yml`,
`.github/workflows/dependabot-automerge.yml`). When changing
dependencies, update `yarn.lock` with Yarn 4 (`yarn install`) and keep
`--immutable` installs working.
