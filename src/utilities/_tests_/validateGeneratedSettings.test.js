import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import convert from "xml-js";
import processConfigXMLData from "../processConfigXMLData";
import processMapXMLData from "../processMapXMLData";
import processStatementsXMLData from "../processStatementsXMLData";
import processLanguageXMLData from "../processLanguageXMLData";

// Validates the study settings files against Quince's own parsers.
//
// The settings directory is supplied by the QSORT_SETTINGS_DIR environment
// variable so this can run against generated files in CI:
//
//   QSORT_SETTINGS_DIR=./settings npx vitest run validateGeneratedSettings
//
// Skipped automatically when the variable is not set.
const DIR = process.env.QSORT_SETTINGS_DIR;
const describeIf = DIR ? describe : describe.skip;

const read = (name) => readFileSync(`${DIR}/${name}`, "utf8");

describeIf("generated study settings", () => {
  it("parses config.xml and exposes the study options", () => {
    const data = convert.xml2js(read("config.xml"), {
      compact: false,
      ignoreComment: true,
      spaces: 4,
    });
    const { configObj, surveyQuestionObjArray, requiredAnswersObj } =
      processConfigXMLData(data);

    expect(configObj.configFileVersion).toBe("1.0.9");
    expect(configObj.studyTitle).toContain("AI Task-Sharing");
    expect(configObj.submitApiUrl).toBe("/api/qsort-submit");
    expect(configObj.initialScreen).toBe("partId");
    expect(configObj.showSurvey).toBe(true);
    expect(configObj.showConsentPage).toBe(true);
    expect(configObj.useThinProcess).toBe(true);
    // the shipped demo token must not be present
    expect(configObj.baserowToken).toBeUndefined();
    expect(surveyQuestionObjArray.length).toBe(7);
    expect(requiredAnswersObj.itemNum2).toBe("no-*?*-response");
  });

  it("parses map.xml into an 11 column grid", () => {
    const data = convert.xml2js(read("map.xml"), {
      compact: true,
      ignoreComment: true,
      spaces: 4,
    });
    const { mapObj, vColsObj } = processMapXMLData(data);

    expect(mapObj.mapFileVersion).toBe("1.0.9");
    expect(mapObj.qSortHeaderNumbers).toEqual([
      "-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5",
    ]);
    expect(mapObj.qSortPattern).toEqual([3, 4, 5, 6, 8, 9, 8, 6, 5, 4, 2]);
    expect(mapObj.colTextLabelsArray.length).toBe(11);
    expect(mapObj.columnHeadersColorsArray.length).toBe(11);
    expect(mapObj.emojiArrayType).toEqual(["emoji5Array"]);
    expect(Object.keys(vColsObj).length).toBe(11);
    expect(vColsObj.columnN5).toBeDefined();
    expect(vColsObj.column5).toBeDefined();
  });

  it("parses statements.xml and matches the grid", () => {
    const data = convert.xml2js(read("statements.xml"), {
      compact: true,
      ignoreComment: true,
      spaces: 4,
    });
    const { columnStatements, totalStatements } = processStatementsXMLData(
      data,
      false,
      {},
    );

    expect(totalStatements).toBe(60);
    expect(columnStatements.statementList.length).toBe(60);
    expect(columnStatements.statementList[0].id).toBe("s1");
    expect(columnStatements.statementList[59].id).toBe("s60");
    expect(columnStatements.statementList[0].statement).toContain(
      "training my own replacement",
    );
    // no duplicate ids
    const ids = columnStatements.statementList.map((s) => s.id);
    expect(new Set(ids).size).toBe(60);
  });

  it("parses language.xml with the study instruction applied", () => {
    const data = convert.xml2js(read("language.xml"), {
      compact: true,
      ignoreComment: true,
      spaces: 4,
    });
    const langObj = processLanguageXMLData(data);

    expect(langObj.langFileVersion).toBe("1.0.9");
    expect(langObj.condOfInst).toContain("most like my view");
    expect(langObj.mobilePresortHelpModalText).toContain("60 statements");
    expect(langObj.mobilePresortHelpModalText).not.toContain("33 statements");
  });
});
