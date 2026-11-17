# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

Medical (DICOM) image viewer web component built on
[DWV](https://github.com/ivmartel/dwv), shipped with a demo application.
Not certified for diagnostic use. License: GPL-3.0.

The main deliverable is the reusable viewer web component library: a single
custom element, `<dwv-viewer>`, bundled as an ES module
(`dist/dwvsimplistic.min.js`). It comes with a demo site (`demo/`, built
into `build/demo/` and deployed to GitHub Pages) that uses the component.
Plain JavaScript (ES modules, no framework, no TypeScript sources), browser
only. The library only exposes what consumers need.

## Requirements

- Viewer inputs: the `<dwv-viewer>` attributes (case insensitive, read
  when the element is first connected, later changes are ignored except
  for the watched ones; full list in the `DwvViewer` JSDoc):
  - `uri` (string, watched): URI with search arguments describing the data
    to load (for ex. `https://www.demo.com/index.html?input=file.dcm`, see
    the dwv `App.loadFromUri` method),
  - `urls` (string, watched): white space separated urls of the data to load,
  - `loadfromwindowlocation` (boolean, default false): use the window
    location as input URI if it has search arguments,
  - `showlegend` (boolean, default false): show the footer legend
    ("Powered by" dwv, with its version),
  - `wlpresetname`, `wlpresetcenter`, `wlpresetwidth`: initial window
    level preset (only used if all three are set),
  - `tools`: white space separated list of viewer tools,
  - `theme`: one or two theme names (light and dark),
  - `height`, `width`: css size of the component.

  The data inputs are checked in order `uri`, `urls`, then
  `loadfromwindowlocation`; the first one that is set is used. `uri` and
  `urls` are watched: when one changes to a new value, it is loaded on top
  of the existing data (`loadfromwindowlocation` is only read on init).
- Toolbar: load progress, the dwv tools (scroll, zoom and pan, window level
  with presets, draw with shapes), reset, orientation toggle, fullscreen and
  DICOM tags dialog. Tools are disabled until data is loaded and when they
  cannot run on it (for ex. window level on colour images).
- Image window: renders the loaded data with dwv and its overlays; data is
  loaded from the viewer inputs, or by drag and drop or file selection
  (local files) through a drop box shown while no data is loaded. It refits
  when its size changes (window resize, right panel opened, closed or
  resized).
- Annotation list: in the right panel, lists the annotation groups and their
  annotations and lets the user navigate to, inspect and edit them, and save
  a group as DICOM SR. It only displays the annotation state, every action
  goes through the annotation service.
- Several viewers must work on the same page:
  - each viewer owns its own dwv app and state, no global singletons for
    viewer state,
  - HTML element ids are built from a unique viewer id
    (e.g. `<viewerId>-layerGroup`),
  - DOM queries are done within the viewer root element (its shadow root)
    rather than `document`,
  - dialogs are attached to their viewer context.

## Design specs

Component behaviour and style are described in framework-agnostic design
specs (`doc/design/`: purpose, placement, data, structure,
actions, accessibility). Read the spec before changing a component and update
it in the same change; add one for any significant new component. The viewer is
modelled on [dwv dev viewer](https://github.com/ivmartel/dwv/blob/develop/dev/viewer/viewer.html);
some modules are ports of it (see the notes at the top of files, the specs
and [dwv linked files](#dwv-linked-files)): keep their behaviour aligned
unless the spec says otherwise, and look there for reference behaviour when
adding features.

## Architecture

- **Services hold the logic, components display state.** `startApp`
  (`applauncher.js`) creates one `DwvAppService` and one `AnnotationService`
  per viewer and passes them to the GUI classes through their constructors
  (`Gui` -> `Toolbar`, `RightPanel`); `Toolbar` creates the viewer
  `TagsService`. Do not create services elsewhere, do not share them between
  viewers (no module level instances) and do not call the dwv `App`
  directly from GUI classes.
- Services keep their state in private fields and expose it read only:
  `AnnotationService` and `TagsService` publish an immutable snapshot
  through the external store contract (`subscribe` / `getSnapshot`), their
  components (`AnnotationList`, `TagsTable`) only render it and
  never mutate it, every change goes through a service method.
- `DwvAppService` and `AnnotationService` extend `EventTarget` and notify
  events with `CustomEvent`s (`DwvAppService` re-dispatches the dwv app
  events and adds its own, `AnnotationService` dispatches `error`).
  Listeners and subscriptions are released when the viewer is disposed
  (`DwvAppService` `dispose` event, sent when the element is removed from
  the document).
- `DwvViewer` creates the viewer id (the element `id` attribute if set,
  else a random id starting with a letter) and passes it to `startApp`;
  services and GUI classes read it from `dwvAppService.getOptions().viewerId`.
  Element ids are `<viewerId>-<name>`, never hard-coded; use the helpers in
  `appgui.js` or the same pattern. Only add an id when something references
  it (`getElementById`, `<label for>`, `aria-controls`, dwv's layer
  group...).

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

Before finishing a change, verify it with the
[verify skill](.agents/skills/verify/SKILL.md): same checks as CI
([.github/workflows/nodejs-ci.yml](.github/workflows/nodejs-ci.yml)),
convention review and manual UI check with the dev server.

## Tests

- [Vitest](https://vitest.dev/) with the `jsdom` environment
  ([vitest.config.js](vitest.config.js)); `vite` is a required peer dependency.
- Tests live in `tests/`, mirroring `src/` (e.g. `src/lib/toolbar.js` ->
  `tests/lib/toolbar.test.js`), named `*.test.js`. They are linted like sources.
- Import `describe`/`test`/`expect` explicitly from `vitest` (no globals).
- `dwv` imports work in tests; prefer testing pure helpers and `DwvAppService`
  logic over full rendering (no canvas in jsdom).
- Add or update tests with behaviour changes.

## Layout

```
src/
  index.js            public exports: startApp, DwvViewer
  dwv-viewer.js       <dwv-viewer> custom element: reads attributes, builds the
                      shadow DOM (header/content/footer), injects CSS, calls startApp
  applauncher.js      startApp(viewerId, options, rootDoc): wires services, GUI, dropbox
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
    annotationList.js
                      AnnotationList: annotation list renderer of the
                      AnnotationService state, based on dwv
                      dev/viewer/src/annotationComponent.js (keep in sync)
    quantificationUI.js
                      annotation quantification rendering, based on dwv
                      dev/viewer/src/quantificationUI.js
    dropboxLoader.js  drag and drop / file input loader
    modal.js          modal dialog
    snackbar.js       transient message (service errors, shown by startApp)
    tagsService.js    TagsService: DICOM tags logic and state store
                      (instance numbers, meta flattening), same design
                      as AnnotationService
    tagsTable.js      TagsTable: DICOM tags modal renderer of the
                      TagsService state (instance slider and tags table)
    icons.js          inline SVG icons and button helpers
  theme/              light/dark/blue/pink + common CSS (Material 3 color roles,
                      see doc/design/theme.md)
  dwv-viewer.css      component styles
tests/                vitest unit tests, mirrors src/
demo/                 demo index.html, PWA manifest, service worker, assets
config/               webpack (common/dev/prod) and full eslint config
.agents/skills/       agent skills (verify: pre-finish checks)
resources/scripts/    outdated Conquest lua script
dist/                 built library bundle (see below)
build/                demo site (build/demo/) and coverage (build/coverage/)
```

## Architecture notes

- Data flow: `DwvViewer` -> `startApp` -> `DwvAppService` + `Gui` + `DropboxLoader`.
  GUI classes call `DwvAppService` methods and listen to its `CustomEvent`s
  (`loadprogress`, `dataloaded`, `dataready`, `presetnames`,
  `ismanualpreset`, `dataadd`, `dataremove`, `drawlayeradd`,
  `annotationadd|update|remove|select`, `error`, `loadabort`, `dispose`).
  Event payloads live in `event.detail`. Add new app-level interactions
  (loading, tools, layout) to `DwvAppService` and expose them the same way.
  `startApp` shows `error` and `loadabort` messages in a snackbar.
- Exception: annotations mirror the dwv viewer (`dev/viewer/src`).
  `AnnotationService` (no DOM access) works on dwv objects itself, through
  the controllers `DwvAppService` exposes like the dwv viewer
  `DwvAppService` (`getDataController`, `getStageController`,
  `getUndoController`, `createAnnotationData`,
  `addAndRenderAnnotationData`). It uses `DrawController`, draw layers and
  `DicomWriter` directly and listens to `annotationgroupeditablechange` on
  the annotation group. `RightPanel` creates the `AnnotationList`.
  Keep that split to ease syncing with dwv.
- Supported viewer tools: `Scroll`, `ZoomAndPan`, `WindowLevel`, `Draw`
  (shapes: Ruler, Arrow, Rectangle, Circle, Ellipse, Protractor, Roi).
  Matching against user input is case insensitive.
- The bundle is self-contained (dwv, konva, jszip and magic-wand are bundled).
  webpack emits the dwv web workers (`*.worker.min.js`) next to it, and they
  are loaded relative to the bundle URL.

## Web component

- Public API documentation of `<dwv-viewer>` attributes is the JSDoc on
  `DwvViewer`; keep it in sync when adding or changing attributes.
- Everything renders inside a shadow root. Look elements up through
  `rootDocument` (`dwvAppService.getOptions().rootDocument`). Build element
  ids as described in [Architecture](#architecture).
- CSS is imported as strings via `css-loader` and injected in a `<style>`
  element. Themes use CSS custom properties; when two themes are given they
  are switched with `prefers-color-scheme`.

## dwv linked files

Some files are adapted from the dwv repository viewer
([dwv/dev/viewer](https://github.com/ivmartel/dwv/tree/develop/dev/viewer),
`dev/pacs` up to v0.37.0-beta.24)
and must be kept in sync with it:

| file | dwv source |
| --- | --- |
| `src/lib/annotationService.js` | `dev/viewer/src/annotationService.js` |
| `src/lib/annotationList.js` | `dev/viewer/src/annotationComponent.js` |
| `src/lib/quantification.js` | `dev/viewer/src/quantification.js` |
| `src/lib/quantificationUI.js` | `dev/viewer/src/quantificationUI.js` |

- When changing them, check the dwv source for the version pinned in
  `package.json` and keep structure, naming and logic close to it so
  upstream changes can be ported as diffs. Keep local adaptations (shadow
  root lookups, viewer id prefixed ids, `dwv` package imports, icons, theme
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
