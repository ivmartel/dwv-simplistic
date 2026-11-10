---
name: verify
description: Verify a change in dwv-simplistic before calling it done. Runs the same checks as CI (lint, tests with coverage, production build), checks repo-specific rules (JSDoc, uid-suffixed ids, rootDocument lookups, DwvAppService boundary, dist/ not committed, demo build) and, for UI changes, drives the dev server with a DICOM input. Use after editing src/, tests/, config/, demo/ or dependencies, or when asked to "verify", "check" or "make sure CI passes".
---

# Verify

Goal: the change passes what CI runs
([.github/workflows/nodejs-ci.yml](../../../.github/workflows/nodejs-ci.yml))
and respects the repo conventions in [AGENTS.md](../../../AGENTS.md).
Report each step as pass / fail / skipped with the relevant output. Do not
commit anything; the user does all commits.

## 1. Scope the change

```sh
git status --short
git diff --stat
```

Classify what changed, it decides which steps below apply:

- `src/**/*.js` -> steps 2-5, plus 6 if it affects rendering/GUI.
- `src/**/*.css`, `src/theme/` -> steps 2, 4, 6 (check light and dark).
- `tests/**` only -> steps 2, 3.
- `config/**`, `package.json`, `yarn.lock` -> steps 2-4 and 7.
- `demo/**` -> step 6 and the demo build check in step 5.

## 2. Lint

```sh
yarn run lint
```

Uses `config/eslint.config-full.js` over `src/`, `tests/` and root `*.js`.
Fix errors rather than disabling rules. Common failures: missing or
incomplete JSDoc (description must be a sentence ending with a period, blank
line before tags, typed `@param`/`@returns`), lines over 80 chars, unused
args without `_` prefix.

## 3. Unit tests with coverage (as CI)

```sh
yarn run test-ci
```

(`vitest run --coverage`.) Use `yarn run test` for quicker iterations.

- Behaviour changes need new or updated tests in `tests/`, mirroring the
  `src/` path, named `*.test.js`, importing `describe`/`test`/`expect` from
  `vitest`.
- Check the coverage text summary for the touched files; new logic in
  `DwvAppService` or pure helpers should be exercised. No thresholds are
  enforced, so flag uncovered new code instead of failing.

## 4. Production build

```sh
yarn run build
```

Must succeed with no new webpack errors. Output goes to the git-ignored
`dist/`; make sure it does not show up in `git status`.

## 5. Convention review of the diff

Read `git diff` and check:

- **Element lookups** go through `rootDocument`
  (`dwvAppService.getOptions().rootDocument`), never `document.getElementById`
  etc. (the component renders in a shadow root).
- **Element ids** are suffixed with the app uid (`<name>-<uid>`), using the
  helpers in `src/appgui.js` or the same pattern.
- **DwvAppService boundary**: GUI code does not touch the dwv `App` directly; new
  app-level interactions are `DwvAppService` methods and/or `CustomEvent`s with
  payload in `event.detail`. Exception: `src/services/annotationService.js` (and
  `src/gui/annotationUI.js`, `quantification.js`) mirror dwv `dev/viewer`
  code and may use dwv objects via the exposed controllers; keep them in
  sync with dwv.
- **Style**: private `#fields`/`#methods` for internal state,
  `typeof x !== 'undefined'` checks, `@import` JSDoc for type-only imports.
- **Public API**: new or changed `<dwv-simple>` attributes are documented in
  the JSDoc of `DwvComponent` (`src/dwv-component.js`).
- **dwv API**: `dwv` is pinned to an exact version; any new call must exist in
  that version (check `node_modules/dwv/dist/dwv.d.ts`).
- **Demo build** (only when `demo/` or `config/` changed): `demo/index.html`
  keeps the `<!-- register-sw ... -->` comment that the demo build replaces.
  Quick check: `yarn run build-demo` succeeds, `build/demo/index.html` loads
  both `register-sw.js` and `dist/dwvsimplistic.min.js`, and every `urlsToCache`
  entry in `demo/service-worker.js` exists under `build/demo/`.
- `dist/` and `build/` are not staged or tracked.

## 6. Manual / browser check (UI changes)

```sh
yarn run start   # webpack dev server, http://localhost:8080
```

Run it in the background. Load data with the `input` query parameter, e.g.:

```
http://localhost:8080/index.html?input=https%3A%2F%2Fraw.githubusercontent.com%2Fivmartel%2Fdwv%2Fmaster%2Ftests%2Fdata%2Fbbmri-53323851.dcm
```

or drag and drop local DICOM files. Workers load from `/*.worker.min.js`
(emitted next to the bundle); a 404 there breaks decoding.

Check, as relevant to the change:

- Image renders, progress bar completes, no console errors.
- Toolbar tools: Scroll, ZoomAndPan, WindowLevel (presets), Draw with each
  touched shape (Ruler, Arrow, Rectangle, Circle, Ellipse, Protractor, Roi).
- Reset, orientation, fullscreen, DICOM tags modal.
- Right panel annotations: add, select, edit, delete, save.
- Themes: light and dark (`prefers-color-scheme`), and any theme attribute
  combination touched (`theme="blue pink"`).
- Several `<dwv-simple>` on one page if ids or lookups changed (edit a
  scratch copy of the demo page, not the committed one).

If a headless browser is available (Chromium/Chrome is installed here), a
headless screenshot or console log capture is acceptable evidence; otherwise
ask the user to check and list exactly what to look at. Stop the dev server
when done.

## 7. Dependency changes

- `yarn install --immutable` passes (lockfile in sync, Yarn 4 via Corepack).
- `dwv` stays an exact version; a dwv bump needs steps 3 and 6 since its API
  is still beta.

## Report

End with a short table: step, result, notes. Mention anything skipped and
why, and any follow-ups (missing tests, manual checks left to the user).
