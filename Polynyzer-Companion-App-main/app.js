// Polynyzer Companion App Core Logic & Navigation

document.addEventListener('DOMContentLoaded', () => {
  // Service Worker Registration for PWA Offline Capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('Service Worker registered:', reg.scope);
          reg.update(); // Force update SW if cache changed
        })
        .catch((err) => console.error('Service Worker registration failed:', err));
    });
  }

  // App State
  let state = {
    selectedShapeName: '',
    sidesCount: 0,
    angleValues: [],
    isCustom: false
  };

  // DOM Elements
  const screen0 = document.getElementById('screen-0');
  const screen1 = document.getElementById('screen-1');
  const screen2 = document.getElementById('screen-2');
  const screen3 = document.getElementById('screen-3');

  const btnGetStarted = document.getElementById('btn-get-started');
  const btnBackScreen1 = document.getElementById('btn-back-screen1');
  const btnBackScreen2 = document.getElementById('btn-back-screen2');
  const btnBackScreen3 = document.getElementById('btn-back-screen3');

  const shapeCards = document.querySelectorAll('.shape-card');
  const customSidesWrapper = document.getElementById('custom-sides-wrapper');
  const customSidesInput = document.getElementById('custom-sides-input');
  const screen1Error = document.getElementById('screen1-error');
  const btnContinue = document.getElementById('btn-continue');

  const screen2Subtitle = document.getElementById('screen2-subtitle');
  const liveDiagramContainer = document.getElementById('live-diagram-container');
  const liveShapeBadge = document.getElementById('live-shape-badge');
  const angleInputsContainer = document.getElementById('angle-inputs-container');
  const btnCheckResult = document.getElementById('btn-check-result');

  const screen3Subtitle = document.getElementById('screen3-subtitle');
  const resultDiagramContainer = document.getElementById('result-diagram-container');
  const resultShapeBadge = document.getElementById('result-shape-badge');
  const resultCard = document.getElementById('result-card');
  const resultIcon = document.getElementById('result-icon');
  const resultStatusText = document.getElementById('result-status-text');
  const resultSumText = document.getElementById('result-sum-text');
  const btnTryAnother = document.getElementById('btn-try-another');

  // Set default page to Title Screen (Screen 0) on load
  showScreen(0);

  // --- NAVIGATION BUTTONS ---

  if (btnGetStarted) {
    btnGetStarted.addEventListener('click', () => {
      showScreen(1);
    });
  }

  if (btnBackScreen1) {
    btnBackScreen1.addEventListener('click', () => {
      showScreen(0);
    });
  }

  if (btnBackScreen2) {
    btnBackScreen2.addEventListener('click', () => {
      showScreen(1);
    });
  }

  if (btnBackScreen3) {
    btnBackScreen3.addEventListener('click', () => {
      showScreen(2);
    });
  }

  // --- SCREEN 1 LOGIC ---

  shapeCards.forEach((card) => {
    card.addEventListener('click', () => {
      shapeCards.forEach((c) => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });

      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      screen1Error.classList.add('hidden');

      const sides = card.getAttribute('data-sides');
      const name = card.getAttribute('data-name');

      if (sides === 'custom') {
        state.isCustom = true;
        state.selectedShapeName = 'Custom';
        customSidesWrapper.classList.remove('hidden');
        customSidesInput.focus();
      } else {
        state.isCustom = false;
        state.selectedShapeName = name;
        state.sidesCount = parseInt(sides, 10);
        customSidesWrapper.classList.add('hidden');
      }
    });
  });

  customSidesInput.addEventListener('input', () => {
    screen1Error.classList.add('hidden');
  });

  btnContinue.addEventListener('click', () => {
    const selectedCard = document.querySelector('.shape-card.selected');

    if (!selectedCard) {
      screen1Error.textContent = 'Select a shape first';
      screen1Error.classList.remove('hidden');
      return;
    }

    if (state.isCustom) {
      const sidesVal = parseInt(customSidesInput.value.trim(), 10);
      if (isNaN(sidesVal) || sidesVal < 3) {
        screen1Error.textContent = 'Select a shape first';
        screen1Error.classList.remove('hidden');
        return;
      }
      state.sidesCount = sidesVal;
    }

    if (state.angleValues.length !== state.sidesCount) {
      state.angleValues = new Array(state.sidesCount).fill('');
    }

    showScreen(2);
    initScreen2();
  });

  // --- SCREEN 2 LOGIC ---

  function initScreen2() {
    screen2Subtitle.textContent = `${state.selectedShapeName} — ${state.sidesCount} angles`;

    angleInputsContainer.innerHTML = '';

    const expectedTotal = (state.sidesCount - 2) * 180;
    const avgAngle = Math.round(expectedTotal / state.sidesCount);

    for (let i = 0; i < state.sidesCount; i++) {
      const fieldGroup = document.createElement('div');
      fieldGroup.className = 'input-field-group';

      const label = document.createElement('label');
      label.className = 'field-label';
      label.setAttribute('for', `angle-input-${i}`);
      label.textContent = `Angle ${i + 1} (degrees)`;

      const input = document.createElement('input');
      input.type = 'number';
      input.id = `angle-input-${i}`;
      input.className = 'app-input angle-input';
      
      const exampleVal = (i % 2 === 0) ? avgAngle + 5 : avgAngle - 5;
      input.placeholder = `e.g. ${exampleVal}`;
      input.setAttribute('data-index', i);
      if (state.angleValues[i] !== undefined && state.angleValues[i] !== '') {
        input.value = state.angleValues[i];
      }

      const errorDiv = document.createElement('div');
      errorDiv.className = 'inline-error hidden';
      errorDiv.id = `angle-error-${i}`;

      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        state.angleValues[index] = e.target.value.trim();
        errorDiv.classList.add('hidden');
        renderLiveDiagram();
      });

      fieldGroup.appendChild(label);
      fieldGroup.appendChild(input);
      fieldGroup.appendChild(errorDiv);
      angleInputsContainer.appendChild(fieldGroup);
    }

    renderLiveDiagram();
  }

  function renderLiveDiagram() {
    liveDiagramContainer.innerHTML = generatePolygonSVG(state.sidesCount, state.angleValues, 'live');

    const allFilled = state.angleValues.every((val) => {
      const num = parseFloat(val);
      return val !== '' && !isNaN(num) && num > 0 && num < 360;
    });

    if (allFilled) {
      liveShapeBadge.textContent = classifyShape(state.angleValues);
      liveShapeBadge.classList.remove('hidden');
    } else {
      liveShapeBadge.classList.add('hidden');
    }
  }

  function classifyShape(values) {
    if (!values || values.length === 0) {
      return 'Convex';
    }

    const numericValues = values.map((value) => parseFloat(value));
    if (numericValues.some((value) => Number.isNaN(value))) {
      return 'Convex';
    }

    const points = buildWalkPoints(values.length, values);
    if (hasSelfIntersection(points)) {
      return 'Intersecting';
    }

    if (numericValues.some((angle) => angle > 180)) {
      return 'Concave';
    }

    return 'Convex';
  }

  function orientation(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  }

  function onSegment(p, q, r) {
    const epsilon = 1e-9;
    if (Math.abs(orientation(p, q, r)) > epsilon) {
      return false;
    }

    return q.x <= Math.max(p.x, r.x) + epsilon && q.x >= Math.min(p.x, r.x) - epsilon &&
      q.y <= Math.max(p.y, r.y) + epsilon && q.y >= Math.min(p.y, r.y) - epsilon;
  }

  function segmentsIntersect(p1, q1, p2, q2) {
    const epsilon = 1e-9;
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    if (Math.abs(o1) <= epsilon && onSegment(p1, p2, q1)) return true;
    if (Math.abs(o2) <= epsilon && onSegment(p1, q2, q1)) return true;
    if (Math.abs(o3) <= epsilon && onSegment(p2, p1, q2)) return true;
    if (Math.abs(o4) <= epsilon && onSegment(p2, q1, q2)) return true;

    return (o1 > epsilon) !== (o2 > epsilon) && (o3 > epsilon) !== (o4 > epsilon);
  }

  function hasSelfIntersection(points) {
    if (!points || points.length < 4) {
      return false;
    }

    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) {
          continue;
        }
        
        const p3 = points[j];
        const p4 = points[(j + 1) % n];
        
        if (segmentsIntersectStrict(p1, p2, p3, p4)) {
          return true;
        }
      }
    }

    return false;
  }

  function segmentsIntersectStrict(p1, p2, p3, p4) {
    const ccw = (A, B, C) => {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    };

    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  }

  btnCheckResult.addEventListener('click', () => {
    let hasError = false;

    for (let i = 0; i < state.sidesCount; i++) {
      const valStr = state.angleValues[i];
      const val = parseFloat(valStr);
      const errorDiv = document.getElementById(`angle-error-${i}`);

      if (valStr === undefined || valStr === '' || isNaN(val)) {
        if (errorDiv) {
          errorDiv.textContent = 'Enter a value';
          errorDiv.classList.remove('hidden');
        }
        hasError = true;
      } else if (val <= 0 || val >= 360) {
        if (errorDiv) {
          errorDiv.textContent = 'Must be between 1° and 359°';
          errorDiv.classList.remove('hidden');
        }
        hasError = true;
      }
    }

    if (hasError) return;

    showScreen(3);
    initScreen3();
  });

  // --- SCREEN 3 LOGIC ---

  function initScreen3() {
    screen3Subtitle.textContent = `${state.selectedShapeName} — verified`;

    const numericValues = state.angleValues.map((v) => parseFloat(v));
    const totalSum = numericValues.reduce((sum, current) => sum + current, 0);
    const expectedSum = (state.sidesCount - 2) * 180;

    const shapeKind = classifyShape(state.angleValues);
    const isIntersecting = shapeKind === 'Intersecting';
    const isCorrect = !isIntersecting && (totalSum === expectedSum);

    const mode = isCorrect ? 'correct' : 'wrong';
    resultDiagramContainer.innerHTML = generatePolygonSVG(state.sidesCount, state.angleValues, mode);

    resultShapeBadge.textContent = shapeKind;

    resultCard.className = `result-card ${isCorrect ? 'correct' : 'wrong'}`;

    if (isCorrect) {
      resultIcon.innerHTML = '<path d="M20 6L9 17l-5-5"/>';
      resultStatusText.textContent = 'Correct';
    } else {
      resultIcon.innerHTML = '<path d="M18 6L6 18M6 6l12 12"/>';
      resultStatusText.textContent = 'Wrong';
    }

    resultSumText.textContent = `Sum: ${totalSum}° / ${expectedSum}°`;
  }

  btnTryAnother.addEventListener('click', () => {
    resetApp();
    showScreen(1);
  });

  function resetApp() {
    state = {
      selectedShapeName: '',
      sidesCount: 0,
      angleValues: [],
      isCustom: false
    };

    shapeCards.forEach((c) => {
      c.classList.remove('selected');
      c.setAttribute('aria-checked', 'false');
    });

    customSidesInput.value = '';
    customSidesWrapper.classList.add('hidden');
    screen1Error.classList.add('hidden');
    liveDiagramContainer.innerHTML = '';
    angleInputsContainer.innerHTML = '';
    resultDiagramContainer.innerHTML = '';
  }

  // --- NAVIGATION HELPER ---

  function showScreen(screenNumber) {
    screen0.classList.add('hidden');
    screen0.classList.remove('active');
    screen1.classList.add('hidden');
    screen1.classList.remove('active');
    screen2.classList.add('hidden');
    screen2.classList.remove('active');
    screen3.classList.add('hidden');
    screen3.classList.remove('active');

    if (screenNumber === 0) {
      screen0.classList.remove('hidden');
      screen0.classList.add('active');
    } else if (screenNumber === 1) {
      screen1.classList.remove('hidden');
      screen1.classList.add('active');
    } else if (screenNumber === 2) {
      screen2.classList.remove('hidden');
      screen2.classList.add('active');
    } else if (screenNumber === 3) {
      screen3.classList.remove('hidden');
      screen3.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- SVG POLYGON WALK RENDERER ---

  function generatePolygonSVG(n, values, mode) {
    const defaultAngle = ((n - 2) * 180) / n;

    const rawAngles = [];
    for (let i = 0; i < n; i++) {
      const val = parseFloat(values[i]);
      if (!isNaN(val) && val > 0 && val < 360) {
        rawAngles.push(val);
      } else {
        rawAngles.push(defaultAngle);
      }
    }

    const L = 60;
    const rawPts = [{ x: 0, y: 0 }];
    let heading = 0;

    for (let i = 0; i < n - 1; i++) {
      const angleVal = rawAngles[i];
      const turn = 180 - angleVal;
      heading += turn;

      const rad = (heading * Math.PI) / 180;
      const prev = rawPts[rawPts.length - 1];
      const nextX = prev.x + L * Math.cos(rad);
      const nextY = prev.y + L * Math.sin(rad);

      rawPts.push({ x: nextX, y: nextY });
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rawPts.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const boxW = Math.max(maxX - minX, 10);
    const boxH = Math.max(maxY - minY, 10);

    const svgW = 280;
    const svgH = 220;
    const padding = 40;

    const scaleX = (svgW - padding * 2) / boxW;
    const scaleY = (svgH - padding * 2) / boxH;
    const scale = Math.min(scaleX, scaleY, 2.5);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const normalizedPts = rawPts.map((p) => {
      const nx = svgW / 2 + (p.x - centerX) * scale;
      const ny = svgH / 2 + (p.y - centerY) * scale;
      return { x: nx, y: ny };
    });

    const pointsAttr = normalizedPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    let fillHex, strokeHex, labelColorHex;

    if (mode === 'correct') {
      fillHex = '#EAF3DE';
      strokeHex = '#3B6D11';
      labelColorHex = '#27500A';
    } else if (mode === 'wrong') {
      fillHex = '#FCEBEB';
      strokeHex = '#A32D2D';
      labelColorHex = '#791F1F';
    } else {
      fillHex = '#E6F1FB';
      strokeHex = '#185FA5';
      labelColorHex = '#185FA5';
    }

    let labelsSVG = '';
    for (let i = 0; i < n; i++) {
      const p = normalizedPts[i];
      const rawVal = values[i];
      let displayVal = '—';
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        displayVal = `${rawVal}°`;
      }

      labelsSVG += `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${labelColorHex}" opacity="0.6" />
        <text x="${p.x.toFixed(1)}" y="${(p.y - 12).toFixed(1)}" 
              fill="${labelColorHex}" class="polygon-vertex-label" text-anchor="middle">
          ${displayVal}
        </text>
      `;
    }

    return `
      <svg class="polygon-svg" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${pointsAttr}" fill="${fillHex}" stroke="${strokeHex}" stroke-width="2" stroke-linejoin="round" />
        ${labelsSVG}
      </svg>
    `;
  }
});
