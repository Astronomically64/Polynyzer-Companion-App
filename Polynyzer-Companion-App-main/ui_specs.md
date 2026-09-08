# UI specification — Polynyzer

Light mode only. Light-blue theme. Mobile-first layout (390px reference
width), but must scale gracefully up through desktop widths — this is not
a mobile-only app. Flat design — no gradients, no drop shadows, no dark
backgrounds. Generous white space. Sentence case for all labels and
buttons (no ALL CAPS, no Title Case except the app name).

## Responsive behavior

- **Reference width (390px):** the layouts described below (single
  column, 3-column shape grid, stacked diagram-above-inputs) are specified
  at this width and must render there without horizontal scrolling.
- **Wider viewports (tablet/desktop):** don't just center a fixed 390px
  column with empty space on either side. Let the layout use the extra
  width — e.g. the shape-selection grid may show more than 3 columns as
  space allows, and Screens 2 and 3 may lay the polygon diagram and the
  form content (inputs, or the result card) side by side instead of
  stacked. Keep a comfortable max content width so lines and controls
  don't stretch edge-to-edge on very large screens.
- All existing design tokens (colors, radii, spacing, type scale) apply
  the same way at every width — only the arrangement changes, not the
  visual language.

## Back navigation

Every screen except Screen 0 (Title) has a back button in a small header
area at the top of the screen, to the left of the screen title:
- A circular icon button, border `1px solid #85B7EB`, background
  `#FFFFFF`, containing a left-pointing chevron/arrow icon in `#185FA5`.
- Tapping it returns to the previous screen in the flow (Screen 1 → Screen
  0, Screen 2 → Screen 1, Screen 3 → Screen 2) without clearing anything
  the student already entered on the screen it returns to.
- This is distinct from the "Try another shape" button on Screen 3, which
  intentionally resets state and returns to Screen 1.

---

## Screen 0 — Title

**Purpose:** entry splash screen shown once on load, before shape
selection. No back button here (nothing precedes it).

**Content, vertically centered:**
- App logo/mark — a simple polygon icon (e.g. a five-point outline built
  from the same line style as the shape icons elsewhere in the app), fill
  `#E6F1FB`, stroke `#185FA5`, sized generously (e.g. ~72–88px), optionally
  in a rounded square badge with a white or light-fill background and a
  `#85B7EB` border to match card styling elsewhere.
- App name `Polynyzer` — larger than the `16px` screen-title size used
  elsewhere (this is the one deliberate Title Case exception already
  permitted for the app name), color `#0C447C`.
- A short one-line tagline in `#185FA5`, `14px`, weight `500`.
- A short 1–2 sentence description in secondary text color (`#5F5E5A`),
  `13px`, explaining what the app does (measure a hand-built polygon's
  angles, check if they're geometrically correct).

**Primary button:** full width (within the same max content width as
other screens), label `Get started`. Same styling as the primary buttons
elsewhere (`#185FA5` background, white text, `8px` radius, `10px`
padding). Tapping it advances to Screen 1.

---

## Design tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Primary accent | `#185FA5` | Buttons, active states, header text |
| Light fill | `#E6F1FB` | Backgrounds, selected cards, page container |
| Border | `#85B7EB` | Card borders, input borders |
| Card background | `#FFFFFF` | White card surfaces |
| Primary text | `#1A1A1A` (or near-black) | Main body text |
| Secondary text | `#5F5E5A` (medium gray) | Subtitles, helper text |
| Muted text | `#888780` | Placeholder text |
| Correct — background | `#EAF3DE` | Result card, correct state |
| Correct — header text | `#27500A` | "Correct" label |
| Correct — body text | `#3B6D11` | Sum readout on correct state |
| Correct — stroke (diagram) | `#3B6D11` | Polygon outline when correct |
| Wrong — background | `#FCEBEB` | Result card, wrong state |
| Wrong — header text | `#791F1F` | "Wrong" label |
| Wrong — body text | `#A32D2D` | Sum readout on wrong state |
| Wrong — stroke (diagram) | `#A32D2D` | Polygon outline when wrong |

No new colors are needed for the convex/concave badge (Screens 2–3) or the
back button (all screens) — reuse existing tokens: badge background
`#FFFFFF`, border `#85B7EB`, text `#185FA5`; back-button icon `#185FA5` on
a `#FFFFFF` circle with a `#85B7EB` border.

### Layout
- Corner radius: `16px` for cards, `12px` for shape-select tiles, `8px` for
  buttons and inputs.
- Card padding: `16px`.
- Grid gap (shape selection grid): `10px`.
- Reference width: `390px` container, single column, no horizontal scroll.

### Typography
- Font: a clean sans-serif (Inter or system default sans-serif).
- App title / screen title: `16px`, weight `500`, color `#0C447C` (a darker
  blue than the primary accent, used only for headings).
- Subtitle: `13px`, weight `400`, color secondary text.
- Field labels: `12px`, color muted text.
- Body / button text: `14px`, weight `500`.
- No text below `11px` anywhere.

### Icons
Simple line/outline style icons only (e.g. Tabler outline icon set).
- Shape icons: triangle, square, pentagon, hexagon, heptagon, octagon,
  dots/ellipsis (for "Custom").
- Result icons: checkmark (correct), X (wrong).

---

## Screen 1 — Shape selection

**Title:** `Polynyzer`
**Subtitle:** `Select the shape you built`

**Shape grid:** 3-column grid of selectable cards. Each card:
- Background `#E6F1FB`, border `1px solid #85B7EB`, radius `12px`, padding
  `12px 6px`, centered content.
- Contains a line-icon (`22px`) in `#185FA5` and a label below it (`11px`,
  color `#0C447C`).
- Tapping a card selects it (add a visual selected state — e.g. `2px`
  solid `#185FA5` border — but keep the same background/radius rules).

Cards, in this order:
1. Triangle (3 sides)
2. Quadrilateral (4 sides)
3. Pentagon (5 sides)
4. Hexagon (6 sides)
5. Heptagon (7 sides)
6. Octagon (8 sides)
7. Custom (dots/ellipsis icon, muted gray background `#F1EFE8` instead of
   blue, since it's a fallback option, not a preset shape)

**Custom sides input:** below the grid, a numeric input labeled
`Number of sides`, shown/enabled specifically when "Custom" is selected
(or always visible — implementer's choice, but must clearly map to the
Custom option).

**Primary button:** full width, bottom of screen, label `Continue`.
Background `#185FA5`, text white, radius `8px`, padding `10px`.
Disabled/no-op until a shape is selected (see validation note below).

**Validation:** if the student taps "Continue" with no shape selected and
no custom side count entered, show an inline error near the grid (`13px`,
`color: var(--text-danger)` equivalent — use `#A32D2D`) reading
`Select a shape first` and do not advance.

---

## Screen 2 — Measurement input

**Title:** `Enter measurements`
**Subtitle:** dynamic, format `[Shape name] — [n] angles`
(e.g. `Triangle — 3 angles`, `Octagon — 8 angles`, `Custom — 7 angles`)

**Live polygon diagram:**
- An SVG line-drawing of the selected polygon rendered above the input
  fields (side-by-side with the input fields instead, on wide/desktop
  viewports — see Responsive behavior above). The outline should reflect
  the angle values actually entered so far, not just a fixed regular
  shape for that `n` — a reflex angle (>180°) should visibly dent that
  vertex inward. It doesn't need to be geometrically perfect (equal-length
  edges won't always form a perfectly closed shape for an arbitrary angle
  sequence); it just needs to clearly read as convex or concave.
- Fill `#E6F1FB`, stroke `#185FA5`, stroke width `2`.
- Each vertex has a text label near it showing the value currently typed
  into the corresponding angle field, updating live as the student types
  (show a placeholder like `—` or `0°` if empty).
- Diagram must generalize to any `n` (not just the 6 presets) so Custom
  shapes render correctly too, and to any mix of convex/reflex angles.
- **Shape-kind badge:** once every angle field has a value, show a small
  pill badge near the diagram reading `Convex` or `Concave` (concave if
  any entered angle is greater than 180°). Hidden while any field is still
  empty. This is informational only — it never affects the Correct/Wrong
  result.

**Angle input fields:** a vertical list, one per side/vertex:
- Label: `Angle [i] (degrees)`, `12px`, muted text color.
- Numeric input below each label, full width, white background, border
  `1px solid #85B7EB`, radius `8px`, height `36px`.
- Placeholder: a plausible example value (implementer's choice, e.g.
  values that don't sum correctly, so it's clearly just a placeholder).
- Accepts values anywhere in `(0°, 360°)` exclusive — this range must
  cover reflex angles (>180°) for concave shapes, not just the 0–180°
  range a convex-only assumption would suggest.

**Primary button:** full width, bottom, label `Check result`. Same style
as Screen 1's button.

**Validation:** if any angle field is empty or non-numeric when "Check
result" is tapped, show an inline error under that field
(`13px`, `#A32D2D`, text `Enter a value`) and do not advance. Clear the
error as soon as the student edits that field. If a field has a numeric
value outside `(0°, 360°)`, show a separate inline error
(`13px`, `#A32D2D`, text `Must be between 1° and 359°`) instead.

---

## Screen 3 — Result

**Title:** `Result`
**Subtitle:** dynamic, format `[Shape name] — verified`

**Polygon diagram:** same diagram component as Screen 2 (including the
`Convex`/`Concave` badge, which is always shown here since all values are
final), but now static (shows the submitted values) and colored by
outcome. On wide/desktop viewports the diagram sits side by side with the
result card and "Try another shape" button rather than stacked above them.
- Correct: fill `#EAF3DE`, stroke `#3B6D11`, label text color `#27500A`.
- Wrong: fill `#FCEBEB`, stroke `#A32D2D`, label text color `#791F1F`.

**Result card** (single card, exactly two possible states — no third
"partial" state):

*Correct state:*
- Background `#EAF3DE`, radius `12px`, padding `12px`.
- Header (bold, `13px`, color `#27500A`): checkmark icon + `Correct`.
- Subtext (`12px`, color `#3B6D11`): `Sum: [total]° / [expected]°`

*Wrong state:*
- Background `#FCEBEB`, radius `12px`, padding `12px`.
- Header (bold, `13px`, color `#791F1F`): X icon + `Wrong`.
- Subtext (`12px`, color `#A32D2D`): `Sum: [total]° / [expected]°`

**Determination logic:**
```
expected = (n - 2) * 180
total = sum of all entered angle values
result = (total === expected) ? "Correct" : "Wrong"
```
No rounding, no tolerance band. Exact equality only.

**Secondary button:** full width, below the result card, label
`Try another shape`. Transparent background, border `1px solid #85B7EB`,
text color `#185FA5`, radius `8px`, padding `10px`. Tapping it returns to
Screen 1 and clears all previously entered values (selected shape, custom
side count, all angle inputs).

---

## Offline / PWA requirements
- App must fully function with no network connection after the first
  visit (see `agent.md` for the technical approach — service worker,
  manifest, local storage).
- No screen in this spec requires a network request to function.

## Explicitly out of scope for this version
- No teacher/progress-tracker dashboard.
- No "close enough" or partial-credit result state.
- No dark mode.
- No user accounts, login, or cloud sync.
- No self-intersecting ("complex") polygon support — only simple polygons
  (convex or concave, non-self-crossing) need to be handled.
