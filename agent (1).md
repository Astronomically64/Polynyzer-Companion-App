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

Students may also (usually by mistake) enter angle sequences that don't
correspond to a valid simple polygon at all — i.e. the sequence, when
walked out edge by edge, produces a shape whose sides cross themselves
(e.g. `12°, 12°, 12°, 23°`). The app must detect this case explicitly
rather than silently scoring it as convex or concave — see
**"Self-intersection detection"** below.

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
- No backend server. All logic (angle-sum calculation, correctness check,
  self-intersection check) runs entirely client-side.
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

- If `sum === expected` **and** the shape is not self-intersecting (see
  below) → result is **"Correct"**.
- If `sum !== expected`, **or** the shape is self-intersecting even when
  the sum happens to match → result is **"Wrong"**.
- There is **no partial-credit or "close enough" state**, and
  self-intersection does not introduce a third result state — it is
  simply one of the reasons a shape can be Wrong. Do not add a
  tolerance/margin-of-error band unless the user explicitly asks for one
  later.

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
Correct/Wrong determination, except that it does not apply at all when
the shape is self-intersecting (see below — an intersecting shape is
neither convex nor concave, it's invalid).

**Self-intersection detection:** an angle sequence can sum to the correct
total and still fail to describe a valid simple polygon, because nothing
about the sum forces the walked-out shape to close on itself without its
edges crossing (e.g. `12°, 12°, 12°, 23°` — all small same-direction turns
that never come close to turning a full 360°, so the closing edge cuts
back across earlier edges). This must be checked as its own step,
independent of the sum check:

1. Reuse the same "walk the polygon" construction used for the diagram
   (fixed-length edges, turning by `180° - angle` at each vertex — see
   Visualization requirement below) to generate the vertex coordinates for
   the *entered* angles (only run this once every angle field is filled
   in; don't run it against the default-filled preview shape).
2. Run a standard segment-intersection test (e.g. the orientation/
   cross-product test) over every pair of **non-adjacent** edges,
   including the closing edge back to the first vertex. Two edges that
   only share an endpoint (adjacent edges) are not a crossing and must be
   skipped, not flagged.
3. If any non-adjacent pair of edges intersects, mark the shape as
   **self-intersecting**. This is independent of, and checked in addition
   to, the exact-sum comparison — a shape can be self-intersecting whether
   its sum is right or wrong, and both problems (if both are present)
   should be knowable, even though only one Wrong state is shown (see
   Screen 3 below for how the message text should distinguish the reason).
4. Use a small epsilon in the cross-product comparisons (points from
   sequences of small angles are nearly collinear and can otherwise cause
   false positives/negatives from floating-point noise).

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
   always rendering a regular convex outline, and a self-intersecting
   input visibly shows crossing edges rather than being silently
   corrected or hidden.
3. **Result** — single screen showing the same polygon diagram (colored to
   match the outcome) plus one feedback card that says either "Correct" or
   "Wrong", with the exact sum and expected sum shown. When the result is
   "Wrong" specifically because the shape is self-intersecting, the
   feedback card's explanatory text should say so (e.g. mention that the
   sides cross) rather than only reporting the sum mismatch — even when
   the sum also happens to be wrong, the intersection is worth calling out
   since it's a different kind of mistake than a miscounted angle. The
   result is still just "Wrong" — this is a difference in message text
   only, not a new outcome state or color.

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
`n`, so it can represent convex, concave, and self-intersecting shapes:
- A practical approach is to "walk" the polygon with fixed-length edges,
  turning by `180° - angle` at each vertex in turn. A reflex angle
  (>180°) produces a negative turn, which naturally creates the inward
  dent of a concave vertex — no separate concave-drawing code path is
  needed. This same walked-out vertex list is the input to the
  self-intersection check described above — don't build a second,
  separate geometry path just for that check.
- While the student is still typing (not all angles filled in yet), fall
  back to a sensible default angle (e.g. the regular-polygon interior
  angle for that `n`) for any empty field so the diagram stays a
  reasonable-looking polygon rather than collapsing or erroring; still
  show the literal entered value (or a placeholder like `—`) in that
  vertex's label.
- The rendered shape doesn't need to be a geometrically perfect closed
  polygon (equal-length edges won't always close exactly for an arbitrary
  angle sequence) — it just needs to clearly convey the polygon's
  approximate form, including whether it's convex, concave, or
  self-intersecting.
- When the walked-out shape is self-intersecting, render it as-is (crossed
  edges and all) rather than trying to auto-correct or reorder points to
  make it look clean — the whole point is that the student sees the same
  tangled shape their physical sticks would make.

## Design tokens
Use the tokens defined at the top of `ui_specs.md` exactly (hex values,
radii, spacing). Do not substitute similar-looking colors. Light mode only
— no dark mode toggle needed for this version.

## What NOT to do
- Do not add a server, API, or database — everything is local/offline.
- Do not add a tolerance/"close enough" result state.
- Do not add a third Correct/Wrong/____ outcome state for self-intersecting
  shapes — they are a Wrong result with a more specific message, not a new
  state, new color, or new icon.
- Do not hardcode the angle-sum formula to a single shape.
- Do not assume every polygon is convex — angle inputs, validation, and the
  diagram must all support reflex (>180°) angles and concave shapes.
- Do not skip the self-intersection check just because the sum matches —
  the two checks are independent.
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
- [ ] Entering a self-intersecting angle sequence (e.g. `12, 12, 12, 23`
      for a quadrilateral) produces a diagram that visibly shows crossing
      edges, and the shape is scored "Wrong" with messaging that mentions
      the self-intersection — even in cases where the sum happens to
      equal the expected total.
- [ ] Adjacent edges (sharing a vertex) are never flagged as intersecting
      — only non-adjacent edge pairs.

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
4. Verify self-intersection handling specifically: enter an angle sequence
   like `12, 12, 12, 23` on Screen 2 and confirm (a) the diagram visibly
   shows crossing edges, (b) Screen 3 reports "Wrong" with messaging that
   calls out the self-intersection rather than only the sum mismatch, and
   (c) a self-intersecting sequence whose sum happens to equal `(n-2)*180`
   is still reported as "Wrong" for the same reason.
5. Check the layout at a small mobile width and a wide desktop width and
   fix any breakpoints that look broken or under-use the space.
6. Add the offline/service-worker layer last, once the app works normally
   online — then verify it still works with the network disabled.
7. Summarize what was built and flag anything in `ui_specs.md` that was
   ambiguous or required a judgment call.
