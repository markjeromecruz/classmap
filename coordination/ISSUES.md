# Issues

C files rows here when a `NEEDS_TEST` task fails. B/A read and resolve.

| ID     | Task   | Severity | Status | Repro | Expected | Actual |
|--------|--------|----------|--------|-------|----------|--------|
| ISS-01 | CM-01 | P2 | CLOSED | Render `<ClassMapForm />`, inspect a11y tree | Subjects fieldset exposes one accessible group named "Subjects" (via `<legend>`) | Two nested groups with same name — outer `<fieldset><legend>Subjects</legend>` plus inner `<div role="group" aria-label="Subjects">`. Screen readers may double-announce. Fix: drop `role="group" aria-label="Subjects"` from the inner div in `components/classmap/ClassMapForm.tsx:148-152`. Non-blocking. **B fix:** dropped inner role+aria-label, fieldset/legend is the sole accessible group. **C verify:** tightened tests/unit/ClassMapForm.test.tsx assertion to `getAllByRole("group", {name: /subjects/i}).toHaveLength(1)`; 41/41 passing. CLOSED. |
| ISS-02 | infra | P2 | CLOSED | `npm test` after tsconfig edit at 2026-05-24T01:57:29Z | tsconfig include covers test files so `@/*` resolves and `npm run lint` typechecks tests | tsconfig.json `exclude` now lists `"vitest.config.mts", "playwright.config.ts", "tests/**"`. Side effects: (1) vite-tsconfig-paths skips the `@/*` mapping in test files (worked around in vitest.config.mts by hard-coding the alias), (2) lint/typecheck no longer covers tests, so type regressions in tests won't fail CI. **A fix (A-08):** added tsconfig.test.json extending root with full include + `@/*` paths; vitest.config.mts points at it via `tsconfigPaths({ projects: ["./tsconfig.test.json"] })`. **C verify:** 69/69 passing. My belt-and-suspenders `resolve.alias` stays as a hedge against future tsconfig drift. CLOSED. |

## Severity

- `P0` — blocks MVP launch (broken happy path, security)
- `P1` — broken feature, must fix before DONE
- `P2` — polish, nice-to-have

## Status

`OPEN` → `FIXING` (B claims) → `RE_TEST` (B done, C re-verifies) → `CLOSED`
