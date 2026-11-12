#!/usr/bin/env node
// Generates the four Quince settings files from `statements.txt` and
// `study.mjs`.
//
//   node qsort-settings/generate-settings.mjs [outputDir]
//
// Output defaults to `qsort-settings/settings`. The GitHub Action overlays
// this directory onto the built Quince bundle, so it must contain exactly
// config.xml, language.xml, map.xml and statements.xml.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { study } from "./study.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] || join(here, "settings"));

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const today = new Date().toISOString().slice(0, 10);
const stamp = `${today}@${new Date().toISOString().slice(11, 19)}`;

// ---------------------------------------------------------------- statements

const statements = readFileSync(join(here, "statements.txt"), "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const gridTotal = study.grid.counts.reduce((a, b) => a + b, 0);

if (statements.length !== gridTotal) {
  console.error(
    `statements.txt has ${statements.length} statements but the grid counts sum to ${gridTotal}.`,
  );
  process.exit(1);
}

if (study.grid.columns.length !== study.grid.counts.length) {
  console.error("grid.columns and grid.counts must be the same length.");
  process.exit(1);
}

const statementsXml = `<?xml version="1.0" encoding="UTF-8"?>

   <statements version="1.0.9" htmlParse="false">

    <!-- 0. FILE INFORMATION -->
    <info order="0-1" id="statementsFileVersion">1.0.9</info>
    <info order="0-2" id="iterationDate">${today}</info>
    <info order="0-3" id="studyTitle">${escapeXml(study.title)}</info>
    <info order="0-4" id="creationDate">${stamp}</info>

    <!-- 1. STATEMENTS -->
${statements
  .map(
    (text, i) =>
      `     <statement id="${i + 1}">${escapeXml(text)}</statement>`,
  )
  .join("\n")}
   </statements>
`;

// ---------------------------------------------------------------------- map

const mapXml = `<?xml version="1.0" encoding="UTF-8"?>

   <map version="1.0.9" htmlParse="false">

    <!-- 0. FILE INFORMATION -->
      <info order="0-1" id="mapFileVersion">1.0.9</info>
      <info order="0-2" id="iterationDate">${today}</info>
      <info order="0-3" id="studyTitle">${escapeXml(study.title)}</info>
      <info order="0-4" id="creationDate">${stamp}</info>

     <!-- 1. Q SORT GRID DESIGN AND COLORS -->
${study.grid.columns
  .map((col, i) => {
    const colour = study.grid.headerColors[i].replace("#", "").toUpperCase();
    return `     <column id="${col}" colour="${colour}">${study.grid.counts[i]}</column>`;
  })
  .join("\n")}
     <item id="qSortHeaderNumbers">${study.grid.headerNumbers.join(",")}</item>
     <item id="qSortHeaders">${study.grid.headerKeys.join(",")}</item>
     <item id="qSortPattern">${study.grid.counts.join(",")}</item>
     <item id="columnHeadersColorsArray">${study.grid.headerColors.join(",")}</item>
     <item id="columnColorsArray">${study.grid.headerColors.join(",")}</item>

     <!-- 2. COLUMN LABELS -->
     <item id="colTextLabelsArray">${study.grid.labels.join(",")}</item>
     <item id="emojiArrayType">${study.grid.emojiArrayType}</item>
     <item id="useColLabelEmojiPresort">false</item>
     <item id="presortEmojiPositiveIndex">8</item>
     <item id="presortEmojiNeutralIndex">4</item>
     <item id="presortEmojiNegativeIndex">0</item>
     <item id="useColLabelNums">false</item>
     <item id="useColLabelText">true</item>
     <item id="useColLabelEmoji">true</item>
     <item id="useColLabelEmojiPostsort">true</item>
     <item id="useColLabelTextPostsort">true</item>
     <item id="useColLabelNumsPostsort">false</item>
   </map>
`;

// ------------------------------------------------------------------- config

const surveyBlock = (q) => {
  const attrs = [`type="${q.type}"`];
  if (q.required !== undefined) attrs.push(`required="${q.required}"`);
  if (q.other !== undefined) attrs.push(`other="${q.other}"`);
  if (q.limited !== undefined) attrs.push(`limited="${q.limited}"`);
  if (q.limitLength !== undefined)
    attrs.push(`limitLength="${q.limitLength}"`);
  if (q.restricted !== undefined)
    attrs.push(`restricted="${q.restricted}"`);

  const options = q.options
    ? q.options.map((o) => escapeXml(o)).join(";;;")
    : "";

  const scale = q.scale
    ? ` scale="${q.scale.map((s) => escapeXml(s)).join(";;;")}"`
    : "";

  // The "information" type is laid out differently from every other type:
  // it has no <label>, and the background colour and the displayed text are
  // both read from the <note> element.
  if (q.type === "information") {
    const bg = q.background ? ` bg="${escapeXml(q.background)}"` : "";
    const text = q.label || q.note || "";
    return `   <item id="survey">
       <input ${attrs.join(" ")}></input>
        <note${bg}>${escapeXml(text)}</note>
   </item>`;
  }

  const lines = [`       <input ${attrs.join(" ")}${scale}>${options}</input>`];
  if (q.label) lines.push(`        <label>${escapeXml(q.label)}</label>`);
  lines.push(`        <note>${escapeXml(q.note || "")}</note>`);
  if (q.placeholder)
    lines.push(`        <placeholder>${escapeXml(q.placeholder)}</placeholder>`);
  return `   <item id="survey">\n${lines.join("\n")}\n   </item>`;
};

const configXml = `<?xml version="1.0" encoding="UTF-8"?>

   <config version="1.0.9" htmlParse="false">

   <!-- HIDDEN OPTIONS - DO NOT DELETE OR CHANGE -->
   <item id="devMode">false</item>
   <item id="traceSorts">true</item>
   <item id="thinGuidanceModalMaxIterations">2</item>
   <item id="setDefaultFontSize">true</item>
   <item id="setDefaultFontSizePresort">true</item>
   <item id="setDefaultFontSizeSort">true</item>
   <item id="setDefaultFontSizePostsort">true</item>
   <item id="setMinCardHeightPostsort">true</item>
   <item id="useThinProcess">${study.useThinProcess}</item>
   <item id="useMobileMode">true</item>
   <item id="emailSubjectLine">${escapeXml(study.emailSubjectLine)}</item>
   <item id="setupTarget">baserow</item>
   <item id="greenCardColor">#E1E1E1</item>
   <item id="yellowCardColor">#E1E1E1</item>
   <item id="pinkCardColor">#E1E1E1</item>
   <item id="sortDirection">positive</item>

   <!-- 0. FILE INFORMATION -->
   <info order="0-a" id="configFileVersion">1.0.9</info>
   <info order="0-b" id="iterationDate">${today}</info>
   <info order="1--" id="creationDate">${stamp}</info>

   <!-- 1. STUDY TITLE -->
   <item order="1-a" id="studyTitle">${escapeXml(study.title)}</item>

   <!-- 2. DATABASE SETUP -->
   <!-- "setupTarget" options: baserow or local -->
   <!-- Submissions are POSTed to submitApiUrl, a route on this site that
        proxies to Baserow using a server-side token. No token is shipped
        to the browser. -->
   <item order="2-a" id="submitApiUrl">${escapeXml(study.submitApiUrl)}</item>
   <item order="2-b" id="emailAddress">${escapeXml(study.emailAddress)}</item>

   <!-- 3. PREVENT MOBILE ACCESS -->
   <item order="3-a" id="preventMobileAccess">false</item>

   <!-- 4. SECOND PROJECT LINKING -->
   <item order="4-a" id="linkToSecondProject">false</item>
   <item order="4-b" id="secondProjectUrl"></item>

   <!-- 5. STATEMENT OR IMAGE SORT -->
   <item order="5-a" id="useImages">false</item>
   <item order="5-b" id="numImages">60</item>
   <item order="5-c" id="imageFileType">jpg</item>
   <item order="5-d" id="imageFormat">postSortImageModal169</item>

   <!-- 6. CONSENT PAGE OPTIONS -->
   <item order="6-a" id="showConsentPage">${study.showConsentPage}</item>
   <item order="6-b" id="showConsentPageHelpModal">true</item>

   <!-- 7. PROJECT ACCESS OPTIONS -->
   <!-- options: anonymous, partId-access, partId, access -->
   <item order="7-a" id="initialScreen">${study.initialScreen}</item>
   <item order="7-b" id="accessCode">${escapeXml(study.accessCode)}</item>

   <!-- 8. COLOR SETTINGS -->
   <item order="8-a" id="headerBarColor">#337ab7</item>
   <item order="8-b" id="defaultFontColor">#2a2a2a</item>
   <item order="8-c" id="showFooterLogo">${study.showFooterLogo}</item>
   <item order="8-d" id="footerLogoPath">${escapeXml(study.footerLogoPath)}</item>

   <!-- 9. PRESORT OPTIONS -->
   <item order="9-a" id="shuffleCards">${study.shuffleCards}</item>
   <item order="9-b" id="defaultFontSizePresort">22</item>

   <!-- 10. SORT OPTIONS -->
   <item order="10-a" id="condOfInstFontSize">20</item>
   <item order="10-b" id="allowUnforcedSorts">false</item>
   <item order="10-c" id="warnOverloadedColumn">true</item>
   <item order="10-d" id="defaultFontSizeSort">16</item>
   <item order="10-e" id="minCardHeightSort">120</item>

   <!-- 11. POSTSORT OPTIONS -->
   <item order="11-a" id="showPostsort">${study.showPostsort}</item>
   <item order="11-b" id="showSecondPosColumn">${study.showSecondPosColumn}</item>
   <item order="11-c" id="showSecondNegColumn">${study.showSecondNegColumn}</item>
   <item order="11-d" id="showBackButton">true</item>
   <item order="11-e" id="postsortCommentsRequired">false</item>
   <item order="10-f" id="requireMinCommentLength">true</item>
   <item order="10-g" id="minWordCountValuePostsort">5</item>
   <item order="10-h" id="defaultFontSizePostsort">16</item>
   <item order="10-i" id="minCardHeightPostsort">120</item>

   <!-- 12. SURVEY -->
   <item order="12-a" id="showSurvey">${study.showSurvey}</item>

${study.survey.map(surveyBlock).join("\n\n")}

   </config>
`;

// ----------------------------------------------------------------- language

const baseLanguage = readFileSync(join(here, "base", "language.xml"), "utf8");

// Replace the text of a single <item id="..."> (or <info id="...">) in the
// base language file.
const setLanguageItem = (xml, id, value) => {
  const pattern = new RegExp(
    `(<(?:item|info)[^>]*\\bid="${id}"[^>]*>)([\\s\\S]*?)(</(?:item|info)>)`,
  );
  if (!pattern.test(xml)) {
    console.warn(`warning: language.xml has no item with id="${id}"`);
    return xml;
  }
  return xml.replace(pattern, `$1${value}$3`);
};

let languageXml = baseLanguage;

languageXml = setLanguageItem(
  languageXml,
  "studyTitle",
  escapeXml(study.title),
);
languageXml = setLanguageItem(
  languageXml,
  "condOfInst",
  escapeXml(study.conditionOfInstruction),
);
languageXml = setLanguageItem(
  languageXml,
  "emailSubjectText",
  escapeXml(study.emailSubjectLine),
);

// The base language file ships with a hard-coded statement count.
for (const { find, replace } of study.languageReplacements || []) {
  if (!languageXml.includes(find)) {
    console.warn(`warning: language.xml does not contain "${find}"`);
    continue;
  }
  languageXml = languageXml.split(find).join(replace);
}

// ------------------------------------------------------------------- output

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "statements.xml"), statementsXml);
writeFileSync(join(outDir, "map.xml"), mapXml);
writeFileSync(join(outDir, "config.xml"), configXml);
writeFileSync(join(outDir, "language.xml"), languageXml);

console.log(`Wrote 4 settings files to ${outDir}`);
console.log(`  statements: ${statements.length}`);
console.log(
  `  grid: ${study.grid.columns.length} columns, ${gridTotal} cards (${study.grid.columns[0]}..${study.grid.columns.at(-1)})`,
);
