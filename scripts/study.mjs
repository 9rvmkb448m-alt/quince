// Study configuration for the Quince Q-sort deployment.
//
// Everything that differs between studies lives here. `generate-settings.mjs`
// turns this file plus `statements.txt` into the four XML files that Quince
// reads at runtime (config.xml, language.xml, map.xml, statements.xml).

export const study = {
  title: "Employee Beliefs About AI Task-Sharing in Fintech",
  shortTitle: "AI Task-Sharing in Fintech",

  // The instruction shown above the sorting grid (language.xml `condOfInst`).
  conditionOfInstruction:
    "Sort the cards according to your own experience of AI in the fintech workplace, from 'most like my view' to 'least like my view'",

  // Sent as the subject line of the fallback email that appears if the
  // submission endpoint fails twice.
  emailAddress: "drkkhan78@gmail.com",
  emailSubjectLine: "Q-sort results: Employee Beliefs About AI Task-Sharing in Fintech",

  // The grid. 11 columns spanning -5..+5, which is the widest range the
  // Quince emoji assets support (emoji5Array has exactly 11 entries).
  grid: {
    columns: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
    // Number of cards each column should end up with. Must sum to the
    // number of statements.
    counts: [3, 4, 5, 6, 8, 9, 8, 6, 5, 4, 2],
    labels: [
      "Very Strongly Disagree",
      "Strongly Disagree",
      "Disagree",
      "Somewhat Disagree",
      "Slightly Disagree",
      "Neutral",
      "Slightly Agree",
      "Somewhat Agree",
      "Agree",
      "Strongly Agree",
      "Very Strongly Agree",
    ],
    headerNumbers: ["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5"],
    headerKeys: ["N5", "N4", "N3", "N2", "N1", "0", "1", "2", "3", "4", "5"],
    headerColors: [
      "#ff6b6b",
      "#ff8585",
      "#ff9f9f",
      "#ffb9b9",
      "#ffd3d3",
      "#F3F4F6",
      "#d3ffd3",
      "#b9ffb9",
      "#9fff9f",
      "#85ff85",
      "#6bff6b",
    ],
    // Which emoji set to use for the column headers. emoji5Array is the
    // 11-column set.
    emojiArrayType: "emoji5Array",
  },

  // Where completed Q sorts are POSTed. This is a route on the site that
  // proxies to Baserow using a server-side token, so the token never reaches
  // the participant's browser.
  submitApiUrl: "/api/qsort-submit",

  // Literal string replacements applied to the base language.xml. The base
  // file ships with a hard-coded statement count and demo wording.
  languageReplacements: [
    {
      find: "There are {{{b}}}33 statements{{{/b}}} in this survey.",
      replace: "There are {{{b}}}60 statements{{{/b}}} in this survey.",
    },
  ],

  // "anonymous" | "partId" | "access" | "partId-access"
  // partId asks each participant for an anonymous participant code.
  initialScreen: "partId",

  accessCode: "fintech2026",

  showConsentPage: true,
  showSurvey: true,
  showPostsort: true,
  showSecondPosColumn: false,
  showSecondNegColumn: false,

  // The Quince footer ships with a logo image. Turn it off unless the study
  // has its own branding.
  showFooterLogo: false,
  footerLogoPath: "./logo/logo.png",

  // Presort puts every statement into agree/disagree/unsure before the
  // main sort. For a 60-statement study this is worth keeping.
  useThinProcess: true,

  shuffleCards: true,

  // The optional questionnaire shown after the sort. Each entry becomes an
  // <item id="survey"> block in config.xml.
  //
  // type: information | text | textarea | radio | select | checkbox |
  //       rating2 | rating5 | rating7 | rating10 | likert
  //
  // The "information" type has no label: its text and background colour are
  // both read from the <note> element, so put the wording in `label`.
  survey: [
    {
      type: "information",
      background: "goldenrod",
      label: "About this questionnaire",
      note: "All fields marked with an * are required. Your answers are collected separately from your Q-sort results and cannot be linked to them.",
    },
    {
      type: "text",
      required: true,
      limited: true,
      limitLength: 100,
      label: "1. How many years of work experience do you have in fintech?*",
      note: "Enter a number of years.",
    },
    {
      type: "select",
      required: false,
      label: "2. What is your current role?",
      options: [
        "Individual contributor",
        "Team lead / supervisor",
        "Middle management",
        "Senior management",
        "Other",
      ],
    },
    {
      type: "radio",
      required: false,
      label: "3. How much direct experience do you have working with AI tools?",
      options: [
        "None",
        "Some - I have used AI tools occasionally",
        "Moderate - I use AI tools regularly",
        "Extensive - AI is a core part of my role",
      ],
    },
    {
      type: "checkbox",
      required: false,
      other: true,
      label: "4. Which areas of your work have been affected by AI so far?",
      options: [
        "Customer service",
        "Fraud detection",
        "Risk assessment",
        "Data analysis",
        "Document processing",
        "Software development",
        "None of these",
      ],
    },
    {
      type: "rating7",
      required: false,
      scale: ["1", "2", "3", "4", "5", "6", "7"],
      label: "5. How do you feel about the pace of AI adoption in your organisation?",
      note: "1 = far too slow, 7 = far too fast",
    },
    {
      type: "textarea",
      required: false,
      label: "6. Is there anything else you would like the researcher to know?",
      note: "",
    },
  ],
};
