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

  // The consent page. Replace the ethics reference before fielding the
  // study.
  consent: {
    titleBarText: "Research Consent",
    text:
      "You are invited to participate in a research study conducted by Dr. Khalid Khan at the American University of Ras Al Khaimah. Before you decide to participate, it is important that you understand why the research is being conducted and what it will involve. Please take the time to read the following information carefully. Feel free to contact the research team with any questions you may have.{{{br /}}}{{{br /}}}{{{b}}}Purpose of the Study{{{/b}}}{{{br /}}}This study examines how employees in the fintech sector think about sharing job tasks with artificial intelligence. The study is exploratory: it does not test a fixed hypothesis, but aims to identify the different viewpoints that exist on the subject. The findings will contribute to the research literature on technology, psychological contracts and organisational change.{{{br /}}}{{{br /}}}{{{b}}}Study Procedures{{{/b}}}{{{br /}}}If you agree to participate, you will be asked to sort a set of 60 statements according to your own perspective, from 'most like my view' to 'least like my view'. You will first make a rough preliminary sort, then refine it, and finally place each statement in a column. After the sort there is an optional short questionnaire about your role and experience with AI. The study will take approximately 20 minutes.{{{br /}}}{{{br /}}}{{{b}}}Benefits{{{/b}}}{{{br /}}}There are no direct benefits to you for participating. The information gathered may help employers and researchers understand employee concerns about AI, and may contribute to the development of responsible approaches to introducing AI at work.{{{br /}}}{{{br /}}}{{{b}}}Confidentiality and Anonymity{{{/b}}}{{{br /}}}Your responses to the sorting task are anonymous. The only identifier linked to your responses is the participant code you enter at the start, which you choose yourself and which is not linked to your name or employer. The optional questionnaire is collected separately from your sorting results and cannot be linked to them. Data is stored on a secure, access-controlled server and reported only in aggregate.{{{br /}}}{{{br /}}}{{{b}}}Voluntary Participation{{{/b}}}{{{br /}}}Your participation in this study is entirely voluntary. You are free to decline to participate, or to withdraw at any time without penalty or loss of benefits to which you are otherwise entitled. If you decide to withdraw, close the webpage and any data collected up to that point will not be used.{{{br /}}}{{{br /}}}{{{b}}}Data Use{{{/b}}}{{{br /}}}Data collected through this study will be used for academic research purposes, presented in conference papers and academic publications, and may be shared with other researchers for replication and further analysis in anonymised form.{{{br /}}}{{{br /}}}{{{b}}}Ethics Approval{{{/b}}}{{{br /}}}This study has been reviewed and approved by the [name of the ethics committee] (reference number: [reference number]).{{{br /}}}{{{br /}}}{{{b}}}Contact Information{{{/b}}}{{{br /}}}If you have any questions about this study, or any concerns about the way it is being conducted, please contact Dr. Khalid Khan at khan@drkk.biz.",
    helpModalHead: "Contact Information",
    helpModalText:
      "Thank you for participating in this research study. If you have any questions about the study, or wish to raise a concern, you can contact Dr. Khalid Khan by email at khan@drkk.biz.",
  },

  // Landing / welcome copy.
  landingHead: "AI Task-Sharing in Fintech",
  welcomeText:
    "{{{h2}}}Employee Beliefs About AI Task-Sharing in Fintech.{{{/h2}}}{{{br/}}}{{{br/}}}{{{p}}}Thank you for helping with this research project{{{/p}}}{{{br/}}}{{{br/}}}{{{br/}}}",
  mobileWelcomeText:
    "{{{h2}}}Employee Beliefs About AI Task-Sharing in Fintech.{{{/h2}}}{{{br/}}}{{{br/}}}{{{p}}}Thank you for helping with this research project{{{/p}}}{{{br/}}}{{{br/}}}{{{br/}}}",
  landingHelpModalText:
    "Thank you for participating in this research study. Please click the &quot;{{{b}}}Continue{{{/b}}}&quot; button at the bottom right side of the screen to go to the next step.",

  // Instructions shown above the presort and sort grids.
  mobilePresortConditionsOfInstruction:
    "Evaluate the Statements According to Your Own Perspective",
  mobileSortConditionsOfInstruction:
    "Rank the Statements According to Your Own Perspective",
  mobileThinConditionsOfInstruction: "Refine Your Evaluations",

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
      label: "1. How many years of general industry experience do you have?*",
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
      type: "radio",
      required: false,
      options: [
        "1 - Far too slow",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7 - Far too fast",
      ],
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
