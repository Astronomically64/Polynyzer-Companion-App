# Agent instructions — Polynyzer companion app

## Project summary
Build **Polynyzer**, the companion web app for a physical hands-on geometry
learning device. The device lets students construct polygons out of
interlocking sticks with an attached protractor, then measure each interior
angle by hand. This app is where students type in the angles they measured
and the app tells them whether their construction is geometrically correct.

Students may build **either convex or concave** polygons with the device
(a concave polygon has at least one interior angle greater than 180°), and
the app must handle and visualize both correctly — do not assume every
shape is convex.

The app must work well on **both mobile and desktop** — this is not a
mobile-only build. Layouts should scale/reflow across the full range of
viewport widths (small phones through wide desktop windows), not just
render correctly at a single fixed reference width.

Read `ui_specs.md` in this same folder before writing any code — it is the
full design and behavior specification and takes priority over assumptions
made here.

## Tech stack
- Plain HTML, CSS, and vanilla JavaScript (no build step, no framework)
  unless the user has already set up a different stack in this workspace —
  check for an existing `package.json` / framework config first and match it.
- No backend server. All logic (angle-sum calculation, correctness check)
  runs entirely client-side.
- Responsive layout: the app must scale cleanly across the full device
  range, from small phones up through desktop browser windows — not just
  the 390px mobile reference width. Use fluid/relative sizing and layout
  breakpoints rather than a single fixed-width design; on wider viewports
  it's fine (and encouraged) to make better use of the extra space (e.g.
  diagram and inputs side-by-side) rather than just centering a
  narrow mobile column with empty space on either side.
- The app must work fully offline after the first load:
  - Register a service worker that caches all static assets (HTML, CSS, JS,
    icons, fonts).
  - Use `localStorage` (or `IndexedDB` if the data model grows) for any
    data that needs to persist between sessions — there is no remote server
    to sync to.
  - Include a `manifest.json` (Web App Manifest) so the app can be
    installed to a home screen as a PWA.

## Core logic (must be exact — do not approximate)
For a polygon with `n` sides, the expected interior angle sum is:

```
expected = (n - 2) * 180
```

This formula holds for **any simple polygon with `n` sides, convex or
concave** — do not apply a different formula, a correction term, or extra
validation for concave shapes. The only difference concave shapes
introduce is that one or more individual angle values may be greater than
180° (a reflex angle); the sum formula and the equality check are
unchanged.

The app compares the **exact sum** of the student's entered angle values
against `expected`.

- If `sum === expected` → result is **"Correct"**.
- If `sum !== expected` (even by 1 degree) → result is **"Wrong"**.
- There is **no partial-credit or "close enough" state**. Only these two
  exact outcomes exist. Do not add a tolerance/margin-of-error band unless
  the user explicitly asks for one later.

This formula must be recalculated per shape — never hardcode `180` as the
expected value for anything other than a triangle.

**Per-angle validation:** each entered angle must be a number strictly
between `0°` and `360°` (exclusive) to be a legal simple-polygon interior
angle — this range must accommodate reflex angles up to just under 360°,
not just the 0–180° range a convex-only assumption would suggest.

**Convex/concave classification:** once every angle for a shape has a
value, classify it as concave if any single angle is greater than 180°,
otherwise convex. Surface this classification to the student (see
Screens 2 and 3 below) — it's informational only and never affects the
Correct/Wrong determination.

## Screens to build
Build exactly 4 screens/views, wired together in a linear flow:

0. **Title screen** — the app's entry point/splash screen. Shows the
   Polynyzer logo/wordmark and a way to proceed to shape selection (e.g. a
   "Get started" button). This is the only screen with no back button,
   since there's nothing before it.
1. **Shape selection** — student picks a polygon type (or enters a custom
   number of sides).
2. **Measurement input** — student enters one angle value per vertex, with
   a live polygon diagram above the inputs. The diagram must reflect the
   actual shape implied by the entered angles (see Visualization
   requirement below), so concave input visibly dents inward rather than
   always rendering a regular convex outline.
3. **Result** — single screen showing the same polygon diagram (colored to
   match the outcome) plus one feedback card that says either "Correct" or
   "Wrong", with the exact sum and expected sum shown.

**Back navigation:** every screen except the title screen (0) needs a
visible back button that returns to the previous screen in the flow
(1 → 0, 2 → 1, 3 → 2), preserving whatever the student already entered on
the screen they're returning to. This is separate from and in addition to
the "Try another shape" button on Screen 3, which resets state and returns
to Screen 1 specifically.

Full field-by-field detail, copy, and states for each screen are in
`ui_specs.md`.

## Visualization requirement
Every shape (triangle through octagon, plus custom `n`-sided polygons) needs
its own simple polygon diagram — not a generic icon — with each angle value
labeled near its corresponding vertex. Reuse one SVG-generation function
that takes `n` and an array of angle values and draws the outline with
labels; don't hand-draw a separate SVG per shape count if `n` can go above 8
(support custom polygons generically).

The diagram must be **driven by the actual angle values**, not just by
`n`, so it can represent both convex and concave shapes:
- A practical approach is to "walk" the polygon with fixed-length edges,
  turning by `180° - angle` at each vertex in turn. A reflex angle
  (>180°) produces a negative turn, which naturally creates the inward
  dent of a concave vertex — no separate concave-drawing code path is
  needed.
- While the student is still typing (not all angles filled in yet), fall
  back to a sensible default angle (e.g. the regular-polygon interior
  angle for that `n`) for any empty field so the diagram stays a
  reasonable-looking polygon rather than collapsing or erroring; still
  show the literal entered value (or a placeholder like `—`) in that
  vertex's label.
- The rendered shape doesn't need to be a geometrically perfect closed
  polygon (equal-length edges won't always close exactly for an arbitrary
  angle sequence) — it just needs to clearly convey the polygon's
  approximate form, including whether it's convex or concave.

## Design tokens
Use the tokens defined at the top of `ui_specs.md` exactly (hex values,
radii, spacing). Do not substitute similar-looking colors. Light mode only
— no dark mode toggle needed for this version.

## What NOT to do
- Do not add a server, API, or database — everything is local/offline.
- Do not add a tolerance/"close enough" result state.
- Do not hardcode the angle-sum formula to a single shape.
- Do not assume every polygon is convex — angle inputs, validation, and the
  diagram must all support reflex (>180°) angles and concave shapes.
- Do not add screens beyond the 4 specified (title, shape selection,
  measurement input, result — no progress tracker / teacher dashboard in
  this version).
- Do not use gradients, drop shadows, or dark backgrounds — flat design only.
- Do not ship a layout that only works at one fixed width — it must scale
  across mobile and desktop viewports.

## Validation checklist before considering a screen done
- [ ] Works with zero network requests after first load (test in airplane
      mode / offline dev tools).
- [ ] Angle sum check is an exact equality, not a range.
- [ ] Diagram updates live as the student edits input fields.
- [ ] Result screen colors and icon match Correct (green) / Wrong (red)
      states exactly as specified in `ui_specs.md`.
- [ ] Works at mobile width (~390px) and at typical desktop widths
      (~1280px+) without horizontal scrolling or awkward stretching at
      either end.
- [ ] Back button is present and functional on every screen except the
      title screen, and returns to the correct previous screen with prior
      input on that screen intact.
- [ ] "Try another shape" button returns to Screen 1 and clears prior input.
- [ ] Entering at least one angle greater than 180° produces a visibly
      concave diagram (not a regular convex polygon) and is still scored
      with the same exact-sum logic as a convex shape.

## Workflow
1. Scaffold the file structure (index.html / css / js, manifest, service
   worker) and confirm it loads before adding screen logic.
2. Build Screen 0 (title), then Screen 1, then Screen 2, then Screen 3,
   wiring up back navigation and testing the full forward-and-back flow
   between them as you go.
3. Verify concave handling specifically: enter at least one angle >180° on
   Screen 2 and confirm the diagram dents inward on both Screen 2 and
   Screen 3, and that the Correct/Wrong check still uses plain exact-sum
   equality.
4. Check the layout at a small mobile width and a wide desktop width and
   fix any breakpoints that look broken or under-use the space.
5. Add the offline/service-worker layer last, once the app works normally
   online — then verify it still works with the network disabled.
6. Summarize what was built and flag anything in `ui_specs.md` that was
   ambiguous or required a judgment call.
