import type { LessonPlan, LessonPlanInput } from "./types";

const FIXED_TIMESTAMP = "2026-05-23T18:00:00.000Z";

const EARLY: LessonPlan = {
  id: "demo-early",
  createdAt: FIXED_TIMESTAMP,
  input: {
    childAge: 6,
    learningStyle: "kinesthetic",
    subjects: ["math", "reading", "writing", "science", "art"],
    hoursPerWeek: 12,
  },
  summary:
    "A hands-on week for early-elementary learners: number stories with manipulatives, read-aloud time with movement prompts, nature-walk science, and an art tie-in that lets ideas land through touch.",
  days: [
    {
      day: "Mon",
      sessions: [
        { subject: "math", title: "Counting with beads", description: "Build sets of 10 using beads on a string, then act out simple add/subtract stories with the beads.", materials: ["beads", "string", "small bowl"], minutes: 30 },
        { subject: "reading", title: "Read-aloud + act it out", description: "Read a short picture book, then take turns acting out a favorite scene with body movements.", materials: ["picture book"], minutes: 30 },
        { subject: "art", title: "Story collage", description: "Tear and glue colored paper to retell one scene from this morning's book.", materials: ["construction paper", "glue stick"], minutes: 30 },
      ],
    },
    {
      day: "Tue",
      sessions: [
        { subject: "writing", title: "Sky-write letters", description: "Practice three lowercase letters by sky-writing them with whole-arm motions, then trace them in sand.", materials: ["tray of sand or salt"], minutes: 25 },
        { subject: "science", title: "Cloud watching", description: "Go outside, lie on backs, name three cloud shapes. Sketch them on return.", materials: ["sketchpad", "pencil"], minutes: 35 },
      ],
    },
    {
      day: "Wed",
      sessions: [
        { subject: "math", title: "Hopscotch math", description: "Chalk a hopscotch grid; hop the answers to single-digit addition problems.", materials: ["sidewalk chalk"], minutes: 30 },
        { subject: "reading", title: "Sight-word hunt", description: "Hide 8 sight-word cards around the room; find and read each one aloud.", materials: ["index cards", "marker"], minutes: 25 },
      ],
    },
    {
      day: "Thu",
      sessions: [
        { subject: "writing", title: "Story dictation", description: "Tell a 3-sentence story; parent writes it down; child copies one sentence.", materials: ["lined paper", "pencil"], minutes: 30 },
        { subject: "science", title: "Sink or float", description: "Predict and test 6 household items in a bowl of water. Record results.", materials: ["bowl", "household items", "chart"], minutes: 30 },
        { subject: "art", title: "Water painting", description: "Paint with plain water on the sidewalk and watch shapes evaporate.", materials: ["paintbrush", "water"], minutes: 20 },
      ],
    },
    {
      day: "Fri",
      sessions: [
        { subject: "math", title: "Shape walk", description: "Walk around the house; tally circles, squares, triangles found. Compare totals.", materials: ["paper", "pencil"], minutes: 25 },
        { subject: "reading", title: "Reader's theater", description: "Re-read this week's favorite book in funny voices for a stuffed-animal audience.", materials: ["this week's books", "stuffed animals"], minutes: 30 },
      ],
    },
  ],
};

const UPPER: LessonPlan = {
  id: "demo-upper",
  createdAt: FIXED_TIMESTAMP,
  input: {
    childAge: 10,
    learningStyle: "visual",
    subjects: ["math", "reading", "writing", "science", "history", "geography"],
    hoursPerWeek: 18,
  },
  summary:
    "A visually-anchored week for upper-elementary learners: graphed math, infographic-style note-taking, a science observation log, and a map-driven look at one historical journey.",
  days: [
    {
      day: "Mon",
      sessions: [
        { subject: "math", title: "Multiplication arrays", description: "Draw 6 multiplication facts as rectangle arrays on graph paper, then label dimensions.", materials: ["graph paper", "colored pencils"], minutes: 45 },
        { subject: "reading", title: "Chapter book + sketchnote", description: "Read one chapter, then sketchnote the main idea and three details on a single page.", materials: ["chapter book", "blank paper"], minutes: 40 },
      ],
    },
    {
      day: "Tue",
      sessions: [
        { subject: "writing", title: "Comic-strip narrative", description: "Plan a 6-panel comic about something that happened this weekend, including dialogue boxes.", materials: ["comic template", "pen"], minutes: 50 },
        { subject: "history", title: "Timeline of one explorer", description: "Pick one explorer; build a horizontal timeline of 5 key events on a long strip of paper.", materials: ["adding-machine tape", "markers"], minutes: 45 },
      ],
    },
    {
      day: "Wed",
      sessions: [
        { subject: "math", title: "Fraction pie charts", description: "Convert 5 fractions into pie-chart sketches; color slices to match.", materials: ["compass or jar lid", "colored pencils"], minutes: 40 },
        { subject: "science", title: "Plant journal day 1", description: "Sketch a plant in detail. Label 6 parts. Begin a 5-day observation log.", materials: ["a houseplant", "journal", "pencil"], minutes: 35 },
        { subject: "geography", title: "Map your block", description: "Walk the block, then draw a labeled map showing 8 landmarks and a compass rose.", materials: ["clipboard", "paper", "pencil"], minutes: 40 },
      ],
    },
    {
      day: "Thu",
      sessions: [
        { subject: "writing", title: "Vocabulary mind-map", description: "Pick 8 words from this week's reading; web them by theme with arrows and color codes.", materials: ["large paper", "colored pens"], minutes: 35 },
        { subject: "history", title: "Then vs Now poster", description: "Two-column poster comparing daily life in your explorer's era to today.", materials: ["poster board", "markers"], minutes: 45 },
      ],
    },
    {
      day: "Fri",
      sessions: [
        { subject: "math", title: "Graphing the week", description: "Bar graph: minutes spent on each subject this week. Discuss which subject got most/least time.", materials: ["graph paper", "ruler"], minutes: 35 },
        { subject: "reading", title: "Visual book review", description: "Make a one-page illustrated review of this week's chapters: rating stars, favorite scene, character sketch.", materials: ["paper", "colored pencils"], minutes: 40 },
        { subject: "science", title: "Plant journal day 5", description: "Final sketch + side-by-side comparison with day 1. Write 3 observations.", materials: ["journal", "pencil"], minutes: 30 },
      ],
    },
  ],
};

const TEEN: LessonPlan = {
  id: "demo-teen",
  createdAt: FIXED_TIMESTAMP,
  input: {
    childAge: 14,
    learningStyle: "reading-writing",
    subjects: ["math", "reading", "writing", "science", "history", "foreign-language"],
    hoursPerWeek: 25,
  },
  summary:
    "A reading- and writing-heavy week for early-high-school learners: algebra problem sets with worked solutions, primary-source history with a written response, and a foreign-language journal entry.",
  days: [
    {
      day: "Mon",
      sessions: [
        { subject: "math", title: "Linear equations set A", description: "Work through 10 single-variable equations; write a one-paragraph explanation of which technique was hardest and why.", materials: ["textbook or printout", "notebook"], minutes: 60 },
        { subject: "reading", title: "Novel: 25 pages + log", description: "Read 25 pages of the current novel; log 5 vocabulary words with definitions and example sentences.", materials: ["novel", "vocab log"], minutes: 60 },
      ],
    },
    {
      day: "Tue",
      sessions: [
        { subject: "writing", title: "Essay outline", description: "Outline a 5-paragraph essay on a prompt of choice: thesis, three body topics with supporting evidence, conclusion.", materials: ["outline template", "laptop or paper"], minutes: 60 },
        { subject: "history", title: "Primary source close-read", description: "Read one primary source; annotate margins; write a 200-word summary identifying author bias.", materials: ["primary source document"], minutes: 60 },
        { subject: "foreign-language", title: "Journal entry", description: "Write a 150-word journal entry in the target language about today; underline new vocabulary.", materials: ["notebook"], minutes: 30 },
      ],
    },
    {
      day: "Wed",
      sessions: [
        { subject: "math", title: "Linear equations set B + check", description: "10 more equations + self-check against an answer key. Re-do any missed problems with written reasoning.", materials: ["worksheet", "answer key"], minutes: 60 },
        { subject: "science", title: "Lab report draft", description: "Draft a lab report from last week's experiment: hypothesis, method, data, conclusion.", materials: ["lab notes", "report template"], minutes: 75 },
      ],
    },
    {
      day: "Thu",
      sessions: [
        { subject: "writing", title: "Essay first draft", description: "Write a complete first draft from Tuesday's outline. Don't edit yet — finish first.", materials: ["laptop or paper"], minutes: 75 },
        { subject: "reading", title: "Novel: 25 more pages", description: "Read 25 more pages; write 3 discussion questions for end-of-week conversation.", materials: ["novel"], minutes: 60 },
      ],
    },
    {
      day: "Fri",
      sessions: [
        { subject: "math", title: "Word problems", description: "Translate 5 word problems into equations; solve; write a sentence for each answer in context.", materials: ["word problem set"], minutes: 60 },
        { subject: "history", title: "Comparative essay paragraph", description: "Write one paragraph comparing two perspectives from this week's primary source and a textbook account.", materials: ["sources"], minutes: 45 },
        { subject: "foreign-language", title: "Translation + reflection", description: "Translate a short paragraph from English to target language; write a 100-word reflection on what was hardest.", materials: ["short text"], minutes: 45 },
      ],
    },
  ],
};

export function getDemoPlan(input: LessonPlanInput): LessonPlan {
  const base = input.childAge <= 8 ? EARLY : input.childAge <= 12 ? UPPER : TEEN;
  return {
    ...base,
    id: `demo-${input.childAge}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    input,
  };
}

export const DEMO_PLANS = { EARLY, UPPER, TEEN } as const;
