# Polynyzer Test Cases

## Test Case 1: Self-Intersecting Quadrilateral
**Input:** Quadrilateral with angles `12°, 12°, 12°, 23°`
- Sum: 12 + 12 + 12 + 23 = 59°
- Expected: (4-2) × 180 = 360°
- Self-intersecting: YES (due to very small turning angles)

**Expected Result:**
- Shape classification: "Intersecting"
- Screen 2 badge: "Intersecting"
- Screen 3 classification: "Intersecting"
- Result: "Wrong"
- Result message: "Sum: 59° / 360° — the sides cross"
- Diagram: Shows crossing edges from the walk algorithm

---

## Test Case 2: Self-Intersecting with Correct Sum
**Input:** Shape that walks with crossing edges but sum equals expected
- Hypothetical: Create an angle sequence where the walk produces intersection but sum is correct
- This tests that self-intersection check is independent of sum check

**Expected Result:**
- Shape classification: "Intersecting"
- Result: "Wrong" (even though sum is correct!)
- Result message: Should still mention "the sides cross"

---

## Test Case 3: Concave but Valid Polygon
**Input:** Quadrilateral with angles `60°, 120°, 240°, 20°`
- Sum: 60 + 120 + 240 + 20 = 440° (wrong)
- Has one reflex angle: 240° > 180°
- Self-intersecting: NO (should be a valid concave quadrilateral)

**Expected Result:**
- Shape classification: "Concave"
- Screen 2 badge: "Concave"
- Diagram: Shows inward dent at the 240° angle
- Result: "Wrong"
- Result message: "Sum: 440° / 360°" (no mention of crossing)

---

## Test Case 4: Correct Convex Polygon
**Input:** Triangle with angles `60°, 60°, 60°`
- Sum: 60 + 60 + 60 = 180°
- Expected: (3-2) × 180 = 180°
- Self-intersecting: NO

**Expected Result:**
- Shape classification: "Convex"
- Result: "Correct"
- Result message: "Sum: 180° / 180°"

---

## Test Case 5: Correct Concave Polygon
**Input:** Quadrilateral with angles `100°, 100°, 100°, 160°`
- Sum: 100 + 100 + 100 + 160 = 460° (wait, this doesn't add up... let me recalculate)
- Actually for a quadrilateral: 100 + 100 + 100 + 60 = 360° ✓
- No reflex angles... let me use: `80°, 100°, 180°, 0°`... no, 0° is invalid
- Use: `80°, 100°, 200°, -20°`... no, negative is invalid  
- Use: `80°, 100°, 200°, -0.0000001°`... this won't work either
- Actually, a concave quadrilateral example would be: `60°, 60°, 240°, 0°`... but 0° is invalid (must be strictly between 0° and 360°)
- Valid concave quadrilateral: `70°, 70°, 220°, 0.00001°`... close to 0 but not quite
- Better: Use an angle just over 180°. For sum = 360°: `70°, 70°, 185°, 35°`
- Sum: 70 + 70 + 185 + 35 = 360° ✓

**Expected Result:**
- Shape classification: "Concave"
- Has one reflex angle: 185° > 180°
- Result: "Correct"
- Diagram: Shows concave shape with inward dent

---

## Key Implementation Checks
1. ✓ `classifyShape()` returns 'Convex', 'Concave', or 'Intersecting'
2. ✓ `buildWalkPoints()` generates points using fixed edge length and `180° - angle` turns
3. ✓ `hasSelfIntersection()` checks all non-adjacent edge pairs
4. ✓ `segmentsIntersectStrict()` uses CCW orientation test with epsilon tolerance
5. ✓ Adjacent edges are skipped (edges sharing a vertex)
6. ✓ `initScreen3()` displays "— the sides cross" when `isIntersecting === true`
7. ✓ Closing edge (n-1 to 0) is properly checked against other edges
8. ✓ Self-intersection check is independent of sum check
9. ✓ Live diagram on Screen 2 shows all classifications including "Intersecting"
10. ✓ Back navigation and "Try another shape" button preserve/clear state correctly
