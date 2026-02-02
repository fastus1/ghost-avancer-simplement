---
phase: 02-theme-branding
plan: 01
subsystem: ui
tags: [ghost-theme, casper, inter-font, typography, woff2]

# Dependency graph
requires:
  - phase: 01-infrastructure-foundation
    provides: Ghost container running in Portainer
provides:
  - Casper fork named avancer-simplement
  - Self-hosted Inter variable font (woff2)
  - fonts.css with @font-face declaration
affects: [02-02, 02-03, 02-04]

# Tech tracking
tech-stack:
  added: [inter-font-v4, gulp, gscan]
  patterns: [self-hosted-fonts, casper-fork]

key-files:
  created:
    - content/themes/avancer-simplement/package.json
    - content/themes/avancer-simplement/assets/fonts/inter/Inter-Variable.woff2
    - content/themes/avancer-simplement/assets/css/fonts.css
  modified: []

key-decisions:
  - "Added author.email to package.json (required by gscan)"
  - "Used Inter v4.0 variable font for maximum flexibility"
  - "Self-hosted font for GDPR compliance and performance"

patterns-established:
  - "Self-hosted fonts in assets/fonts/ directory"
  - "CSS font declarations in assets/css/fonts.css"

# Metrics
duration: 3min
completed: 2026-02-02
---

# Phase 02 Plan 01: Theme Foundation Summary

**Casper 5.9.0 forked as avancer-simplement with self-hosted Inter variable font (woff2) for Circle.so visual identity**

## Performance

- **Duration:** 2 min 47 sec
- **Started:** 2026-02-02T01:41:11Z
- **Completed:** 2026-02-02T01:43:58Z
- **Tasks:** 2
- **Files created:** 53 (51 from Casper + 2 new)

## Accomplishments
- Forked Casper 5.9.0 theme with renamed identity (avancer-simplement)
- Downloaded and self-hosted Inter v4.0 variable font
- Created fonts.css with @font-face declaration ready for CSS import
- Theme passes gscan validation for Ghost 6.x

## Task Commits

Each task was committed atomically:

1. **Task 1: Fork Casper and rename theme** - `a82908f` (feat)
2. **Task 2: Self-host Inter variable font** - `45d9386` (feat)

## Files Created/Modified
- `content/themes/avancer-simplement/package.json` - Theme identity (name, version, author)
- `content/themes/avancer-simplement/assets/fonts/inter/Inter-Variable.woff2` - Self-hosted Inter font
- `content/themes/avancer-simplement/assets/css/fonts.css` - @font-face declaration
- All Casper template files (.hbs) - Unchanged, ready for customization

## Decisions Made
- Added author.email field (contact@avancer-simplement.fr) to satisfy gscan validation requirement
- Used format('woff2-variations') for variable font support
- Font-weight range 100-900 covers all Inter weights in single file

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added author.email to package.json**
- **Found during:** Task 1 (gscan validation)
- **Issue:** gscan requires package.json "author.email" property
- **Fix:** Added email field to author object
- **Files modified:** package.json
- **Verification:** gscan passes with no errors
- **Committed in:** a82908f (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix required for gscan validation. No scope creep.

## Issues Encountered
- `unzip` command not available - used Python zipfile module instead to extract font

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Theme scaffold ready for CSS customization (02-02)
- Inter font ready to be imported in screen.css
- Template files (.hbs) ready for layout modifications (02-03)

---
*Phase: 02-theme-branding*
*Completed: 2026-02-02*
