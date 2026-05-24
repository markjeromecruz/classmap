// ClassMap v2 Portfolio Report — canned demo fixture for Pages/demo mode.

export const CANNED_PORTFOLIO_REPORT: string = `# Homeschool Portfolio — Sample Child, Grade 4
**Period:** 2026-04-01 to 2026-04-30

## Summary
Sample Child completed a balanced month of fourth-grade work across math, reading, writing, science, and history. Instruction was delivered four to five days per week using an eclectic, mostly Charlotte-Mason approach. Total instructional time for the period was approximately 36 hours.

## Subjects Covered
- Math: 6 tasks · 360 minutes
- Reading: 5 tasks · 300 minutes
- Writing: 4 tasks · 240 minutes
- Science: 4 tasks · 480 minutes
- History: 3 tasks · 780 minutes

## Total Instructional Time
2,160 minutes total (36.0 hours).

## Sample Activities
- Multi-digit multiplication practice with area-model diagrams
- Read-aloud and narration from "Charlotte's Web," chapters 6-12
- Two-paragraph descriptive essay on a spring nature walk
- Solar-system scale model using fruit and household objects
- Timeline project: early colonial settlements, 1607-1640

## Portfolio Entries
- 2026-04-08 · writing: First draft and revised version of descriptive essay; comparison shows clear improvement in sentence variety.
- 2026-04-17 · science: Photos and labeled diagram from the solar-system scale activity, with a short written reflection.
- 2026-04-25 · history: Hand-drawn colonial timeline with five annotated events and a one-page summary.

## Work Samples
- writing-essay-spring-walk-draft.pdf
- writing-essay-spring-walk-final.pdf
- science-solar-system-photos.pdf
- history-colonial-timeline.pdf

## State Compliance — California (CA)
- Hours/year required: no minimum
- Subjects required: reading, writing, math, science, history
- Portfolio required: no
- Standardized testing required: no
- Notice of intent required: yes (Private School Affidavit filed annually with the California Department of Education between October 1 and October 15)

Status: Operating under the Private School Affidavit (PSA) option. California sets no annual instructional-hour minimum for PSA-registered home schools. All required subjects were addressed during this period. Hours instructed: 36.0 — no annual minimum applies.

*Report generated from parent-provided data. Verify all figures before submitting.*`;

export function getCannedPortfolioReport(childName?: string): string {
  if (!childName || childName.trim().length === 0) {
    return CANNED_PORTFOLIO_REPORT;
  }
  return CANNED_PORTFOLIO_REPORT.split("Sample Child").join(childName.trim());
}
