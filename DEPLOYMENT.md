# Deploying this Quince fork

This fork runs the **Employee Beliefs About AI Task-Sharing in Fintech** Q
study. It is deployed as a static bundle inside the portfolio site at
`/qsort/`, with submissions proxied to Baserow by a server-side route.

## Layout

```
scripts/study.mjs             study definition - title, grid, questionnaire, wording
scripts/statements.txt        the 60 statements, one per line
scripts/statement-themes.json which statements belong to which theme
scripts/base/language.xml     base UI language file (English)
scripts/generate-settings.mjs writes public/settings/*.xml from the two files above
public/settings/              GENERATED - do not hand edit
src/                          the Quince application
```

`public/settings/` is generated. Edit `scripts/study.mjs` or
`scripts/statements.txt` and re-run the generator:

```bash
node scripts/generate-settings.mjs public/settings
```

The generator only rewrites a file when its content actually changed, so
re-running it on an unchanged study leaves the working tree clean.

### Themes

Quince has no theme field: a participant's sort records which column each
statement ended up in, and nothing about the theme it came from. The mapping
from statement id to theme lives in `scripts/statement-themes.json`, which is
what turns the column results back into themes for thematic analysis.

The themes in the source document are contiguous blocks of six statements:

| Theme | Statements |
| --- | --- |
| 1. Job Security and Replacement | 1-6 |
| 2. Psychological Contract (Unwritten Expectations) | 7-12 |
| 3. Task Identity and Professional Value | 13-18 |
| 4. Trust and AI Capability | 19-24 |
| 5. Control, Autonomy, and Oversight | 25-30 |
| 6. Organizational Loyalty and Fairness | 31-36 |
| 7. Opportunity vs. Threat (Freedom for Meaningful Work) | 37-42 |
| 8. Accountability and Risk | 43-48 |
| 9. Skill Relevance and Future-Proofing | 49-54 |
| 10. Resistance vs. Acceptance | 55-60 |

If `statements.txt` changes, `statement-themes.json` has to change with it.
The generator checks that the map still covers exactly the statements that
exist and fails loudly if it does not.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

The dev server serves `public/settings/` directly, so regenerate the settings
before starting if you changed them.

```bash
npm test             # watch mode
npx vitest run       # single run
npm run lint
```

## Build

```bash
PUBLIC_BASE_PATH=/qsort/ npm run build
```

`PUBLIC_BASE_PATH` is the absolute path the bundle is served from. The app
resolves its asset URLs and its `settings/*.xml` fetches against it, so it
works from any sub-directory. Without the variable the base is `./` (relative),
which is fine for a standalone deployment.

The build output goes to `dist/`.

## Submissions

Completed Q sorts are POSTed to `submitApiUrl` in `config.xml`, which is set
to `/api/qsort-submit` - a route on the portfolio site. That route holds the
Baserow token and forwards the request, so the token is never sent to the
participant's browser.

Set these on the server that hosts the site:

| Variable            | Meaning                        |
| ------------------- | ------------------------------ |
| `BASEROW_TOKEN`     | Baserow API token              |
| `BASEROW_TABLE_ID`  | Numeric id of the target table |

To talk to Baserow directly from the browser instead, remove `submitApiUrl`
from `config.xml` and set `baserowToken` and `baserowDatabaseIdNumber`. That
puts the token in front of every participant, so it is only appropriate for a
throwaway demo.

## Changes from upstream

Fixes and additions on top of `shawnbanasick/quince`:

- **`isLoggedIn` read from the wrong store** (`Presort.jsx`, `MobilePresort.jsx`).
  It was read from `useSettingsStore`, where it does not exist, so it was
  always `undefined` and the "please log in first" gate never fired. Studies
  that require a participant ID could therefore be entered without one.
- **`bg` attribute of an `information` survey question was never read**
  (`processConfigXMLData.js`). It lives on the `<note>` element but was read
  from the `<input>` element, so the information banner always fell back to
  grey.
- **`qSortPattern` was left as an array of strings** (`processMapXMLData.js`).
  It was converted to numbers and then immediately overwritten by the generic
  item loop.
- **The mobile submit button never cleared its timeout on success**
  (`MobileSubmitButtonBaserow.jsx`), so a participant who submitted
  successfully saw a spurious "no internet connection" warning ten seconds
  later.
- **`submitApiUrl`** support (`src/utilities/getSubmitRequest.js`) so the
  Baserow token can stay on the server.
- **Configurable footer logo** (`showFooterLogo`, `footerLogoPath`).
- **Base-path aware** settings and asset URLs, so the app can be served from a
  sub-directory.
- **Vitest upgraded to 4.x.** Vitest 3.2 cannot transform JSX under Vite 8,
  which made the whole test suite fail with `ReferenceError: React is not
  defined`.
- Removed the committed `vite.config.js.timestamp-*.mjs` build artefact and
  added it to `.gitignore`.
- `src/utilities/_tests_/validateGeneratedSettings.test.js` validates the
  generated settings against the app's own parsers. It is skipped unless
  `QSORT_SETTINGS_DIR` is set:

  ```bash
  QSORT_SETTINGS_DIR=public/settings npx vitest run validateGeneratedSettings
  ```
