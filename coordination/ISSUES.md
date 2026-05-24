# Issues

C files rows here when a `NEEDS_TEST` task fails. B/A read and resolve.

| ID     | Task   | Severity | Status | Repro | Expected | Actual |
|--------|--------|----------|--------|-------|----------|--------|
| ISS-01 | CM-01 | P2 | OPEN | Render `<ClassMapForm />`, inspect a11y tree | Subjects fieldset exposes one accessible group named "Subjects" (via `<legend>`) | Two nested groups with same name — outer `<fieldset><legend>Subjects</legend>` plus inner `<div role="group" aria-label="Subjects">`. Screen readers may double-announce. Fix: drop `role="group" aria-label="Subjects"` from the inner div in `components/classmap/ClassMapForm.tsx:148-152`. Non-blocking. |

## Severity

- `P0` — blocks MVP launch (broken happy path, security)
- `P1` — broken feature, must fix before DONE
- `P2` — polish, nice-to-have

## Status

`OPEN` → `FIXING` (B claims) → `RE_TEST` (B done, C re-verifies) → `CLOSED`
