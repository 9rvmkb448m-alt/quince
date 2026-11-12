#!/usr/bin/env node
// Prints the Baserow schema the app will POST, so the target table can be
// built to match.
//
//   node scripts/print-baserow-schema.mjs
//
// The app posts a flat object of field name -> value. Field names are
// r1, r2, r3 ... in a fixed order:
//
//   r1-r13  study metadata and time on page
//   r14-r19 presort counts and statement lists
//   r20     the sort result (each statement's column)
//   r21     the presort trace
//   r22..   postsort comments, then the survey answers
//
// The tail is not fixed: it depends on how many postsort comment slots the
// grid needs and on how many survey questions the study has. Re-run this
// after changing either.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import convert from "xml-js";
import processMapXMLData from "../src/utilities/processMapXMLData.js";
import createBaserowObject from "../src/pages/submit/createBaserowObject.js";
import convertObjectToBaserowResults from "../src/pages/sort/convertObjectToBaserowResults.js";
import addNoResultToPostsortResults from "../src/pages/submit/addNoResultToPostsortResults.js";
import { study } from "./study.mjs";

const here = dirname(fileURLToPath(import.meta.url));

// The app runs in a browser; these modules read localStorage.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const mapPath = join(here, "..", "public", "settings", "map.xml");
const { mapObj } = processMapXMLData(
  convert.xml2js(readFileSync(mapPath, "utf8"), {
    compact: true,
    ignoreComment: true,
    spaces: 4,
  }),
);

const configObj = {
  showPostsort: study.showPostsort,
  showSurvey: study.showSurvey,
  showSecondPosColumn: study.showSecondPosColumn,
  showSecondNegColumn: study.showSecondNegColumn,
  postsortCommentsRequired: study.postsortCommentsRequired ?? false,
};

// ---- simulate a completed sort -------------------------------------------

const headers = mapObj.qSortHeaders;
const counts = mapObj.qSortPattern;
const vCols = {};
let n = 1;
headers.forEach((h, i) => {
  vCols[`column${h}`] = Array.from({ length: counts[i] }, () => ({
    id: `s${n}`,
    statementNum: n,
    statement: `Statement ${n}`,
    sortValue: 222,
    psValue: 1,
  }));
  n += 1;
});
const resultsSortObj = { vCols, statementList: [] };

store.set(
  "resultsPresort",
  JSON.stringify({
    npos: 30,
    nneu: 10,
    nneg: 20,
    posStateNums: ["1"],
    neuStateNums: ["2"],
    negStateNums: ["3"],
  }),
);
store.set("sortColumns", JSON.stringify(resultsSortObj));
store.set("resultsPostsort", JSON.stringify({}));

const resultsSurvey = {};
study.survey.forEach((_, i) => {
  resultsSurvey[`itemNum${i + 1}`] = "answer";
});
store.set("resultsSurvey", JSON.stringify(resultsSurvey));

// ---- rebuild the payload the way Submit.jsx does -------------------------

const baserowResults = {};
baserowResults.r1 = study.title;
baserowResults.r2 = "(randomId): ...";
baserowResults.r3 = "(partId): ...";
baserowResults.r4 = "(urlUsercode): ...";
baserowResults.r5 = "(dateTime): ...";
baserowResults.r6 = "(desktop/mobile): desktop";
for (let i = 7; i <= 13; i++) baserowResults[`r${i}`] = "(time on page): ...";

Object.assign(baserowResults, createBaserowObject());

let counter = 22;

if (configObj.showPostsort) {
  const postsort = addNoResultToPostsortResults(
    JSON.parse(store.get("resultsPostsort")),
    mapObj,
    configObj,
  );
  for (const key of Object.keys(postsort)) {
    const col = key.split("_")[0];
    baserowResults[`r${counter}`] = `${col}: ...`;
    counter++;
  }
}

if (configObj.showSurvey) {
  for (const key of Object.keys(resultsSurvey)) {
    baserowResults[`r${counter}`] = `${key}: ...`;
    counter++;
  }
}

Object.assign(
  baserowResults,
  convertObjectToBaserowResults(
    { ...resultsSortObj },
    JSON.parse(store.get("resultsPresort")),
  ),
);

// ---- report ---------------------------------------------------------------

const keys = Object.keys(baserowResults);
// The r-numbers are not in key order (r20/r21 are assigned last), so take
// the highest rather than the last.
const lastR = Math.max(
  ...keys.filter((k) => /^r\d+$/.test(k)).map((k) => Number(k.slice(1))),
);

console.log(`\nThe Baserow table needs ${lastR} text columns, named r1 ... r${lastR}.\n`);
console.log("  r1        study title");
console.log("  r2        random id");
console.log("  r3        participant id");
console.log("  r4        url usercode");
console.log("  r5        date and time");
console.log("  r6        desktop or mobile");
console.log("  r7-r13    seconds spent on each page");
console.log("  r14       number of statements rated positive");
console.log("  r15       number rated neutral");
console.log("  r16       number rated negative");
console.log("  r17       positive statement numbers");
console.log("  r18       neutral statement numbers");
console.log("  r19       negative statement numbers");
console.log("  r20       the sort: each statement's column, e.g. -5|-5|0|3");
console.log("  r21       the presort trace");
let r = 22;
if (configObj.showPostsort) {
  const postsort = addNoResultToPostsortResults(
    JSON.parse(store.get("resultsPostsort")),
    mapObj,
    configObj,
  );
  for (const key of Object.keys(postsort)) {
    console.log(`  r${r}       postsort comment: ${key}`);
    r++;
  }
}
if (configObj.showSurvey) {
  study.survey.forEach((q, i) => {
    const label = (q.label || q.type).replace(/\s*\*\s*$/, "");
    console.log(`  r${r}       survey: ${label}`);
    r++;
  });
}

console.log("\nAll values are text, so make every column a single-line text field.");
console.log(
  "\nThe app posts to /api/database/rows/table/<table id>/?user_field_names=true",
);
console.log(
  "so the names must match exactly - r1, r2, ... with no spaces.\n",
);
