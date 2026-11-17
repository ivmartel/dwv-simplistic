---
name: verify
description: Verify a change in dwv-simplistic before calling it done. Runs the same checks as CI (lint, tests with coverage, demo build), checks repo-specific rules (JSDoc, viewer id prefixed element ids, rootDocument lookups, DwvAppService boundary, dist/ not committed, demo build) and, for UI changes, drives the dev server with a DICOM input. Use after editing src/, tests/, config/, demo/ or dependencies, or when asked to "verify", "check" or "make sure CI passes".
---

# Verify

Goal: the change passes what CI runs and respects the repo conventions in
[AGENTS.md](../../../AGENTS.md). Report each step as pass / fail / skipped
with the relevant output. Do not commit anything; the user does all commits.

CI ([.github/workflows/nodejs-ci.yml](../../../.github/workflows/nodejs-ci.yml))
has a `build` job that runs, in order, `yarn install --immutable`,
`yarn run lint`, `yarn run test-ci` then `yarn run build-demo`; all must
pass. Its `deploy` job pushes `build/demo/` to `gh-pages` (main and release
tags only), so a broken demo build blocks the deploy.

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
- `demo/**` -> steps 4 and 6.

## 2. Lint

```sh
yarn run lint
```

Uses `config/eslint.config-full.js` over `src/`, `tests/` and root `*.js`.
Fix errors rather than disabling rules (rules in
[Code style](../../../AGENTS.md#code-style)); the most frequent failures are
incomplete JSDoc and lines over 80 chars.

## 3. Unit tests with coverage (as CI)

```sh
yarn run test-ci
```

(`vitest run --coverage`.) Use `yarn run test` for quicker iterations.

- Behaviour changes need new or updated tests, written as described in
  [Tests](../../../AGENTS.md#tests).
- Coverage uses the v8 provider over `src/**/*.js`; reports (text, html,
  lcov) go to `build/coverage/`, open `build/coverage/index.html` for
  details.
- Check the coverage text summary for the touched files; new logic in
  `DwvAppService` or pure helpers should be exercised. No thresholds are
  enforced, so flag uncovered new code instead of failing.

## 4. Demo build (as CI)

```sh
yarn run build-demo
```

Writes the demo site to `build/demo/` (see
[Build output and releases](../../../AGENTS.md#build-output-and-releases)).
It must succeed with no new webpack errors. When `config/`, `src/index.js`
or the bundle setup changed, also run `yarn run build` (library bundle into
`dist/`, used by npm publish). Then check:

- `build/demo/index.html` loads both `register-sw.js` and
  `dist/dwvsimplistic.min.js` (proof the `<!-- register-sw ... -->` marker
  was kept),
- every `urlsToCache` entry in `demo/service-worker.js` exists under
  `build/demo/`,
- `dist/` and `build/` do not show up in `git status`.

## 5. Convention review of the diff

Read `git diff` and check it against the rules of
[AGENTS.md](../../../AGENTS.md):

- **Lookups and ids** ([Web component](../../../AGENTS.md#web-component),
  [Architecture](../../../AGENTS.md#architecture)): lookups through
  `rootDocument`, never `document`; ids `<viewerId>-<name>`, only when
  referenced.
- **Services** ([Architecture](../../../AGENTS.md#architecture)): created only
  where allowed, one per viewer, released on `dispose`; GUI classes do not
  call the dwv `App`, components do not mutate snapshots. The
  [dwv linked files](../../../AGENTS.md#dwv-linked-files) are the exception
  and stay in sync with dwv.
- **Style** ([Code style](../../../AGENTS.md#code-style)): what eslint does
  not catch (private `#` members, `typeof` checks, `@import` type imports).
- **Docs in the same change**: `DwvComponent` JSDoc and AGENTS.md
  requirements for attribute changes, `doc/design/` spec for component
  behaviour or style changes.
- **dwv API**: `dwv` is pinned to an exact version; any new call must exist in
  that version (check `node_modules/dwv/dist/dwv.d.ts`).

## 6. Manual / browser check (UI changes)

```sh
yarn run start   # webpack dev server, http://localhost:8080, live reload
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
  touched shape (Ruler, Arrow, Rectangle, Circle, Ellipse, Protractor, Roi);
  tools are disabled before load and when they cannot run on the data.
- Reset, orientation, fullscreen, DICOM tags modal.
- Right panel annotations: add, select, edit, delete, save; the image refits
  when the panel is opened, closed or resized.
- Themes: light and dark (`prefers-color-scheme`), and any theme attribute
  combination touched (`theme="blue pink"`).
- Watched `uri` / `urls` attributes: changing them loads the new data on top
  of the existing one.
- Several `<dwv-simple>` on one page if ids, lookups, services or dialogs
  changed (edit a scratch copy of the demo page, not the committed one).

If a headless browser is available (Chromium/Chrome is installed here), a
headless screenshot or console log capture is acceptable evidence; otherwise
ask the user to check and list exactly what to look at. Stop the dev server
when done.

## 7. Dependency changes

- `yarn install --immutable` passes (lockfile in sync).
- `dwv` stays an exact version; a dwv bump needs steps 3 and 6 since its API
  is still beta, plus the linked files port described in
  [dwv linked files](../../../AGENTS.md#dwv-linked-files).

## Report

End with a short table: step, result, notes. Mention anything skipped and
why, and any follow-ups (missing tests, manual checks left to the user,
fixes that belong upstream in dwv).
