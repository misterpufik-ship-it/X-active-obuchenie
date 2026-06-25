/* Canvas annotation editor for lesson builder */

const RAINBOW_COLORS = [
  "#e53935",
  "#ff6f00",
  "#fdd835",
  "#43a047",
  "#00897b",
  "#1e88e5",
  "#3949ab",
  "#8e24aa",
  "#d81b60",
  "#17202a",
  "#ffffff",
];

function annotationId() {
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointNearSegment(p, a, b, tolerance = 10) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (!len2) return dist(p, a) <= tolerance;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * dx, y: a.y + t * dy };
  return dist(p, proj) <= tolerance;
}

function textMetrics(ctx, item) {
  ctx.font = `700 ${item.size || 22}px Segoe UI`;
  const text = item.text || "";
  const width = ctx.measureText(text).width;
  const height = (item.size || 22) + 14;
  return { width, height };
}

function annotationBounds(ctx, item) {
  if (item.type === "rect") {
    return { x: item.x, y: item.y, w: item.w, h: item.h };
  }
  if (item.type === "circle") {
    return { x: item.cx - item.r, y: item.cy - item.r, w: item.r * 2, h: item.r * 2 };
  }
  if (item.type === "arrow") {
    const x = Math.min(item.x1, item.x2);
    const y = Math.min(item.y1, item.y2);
    return { x, y, w: Math.abs(item.x2 - item.x1), h: Math.abs(item.y2 - item.y1) };
  }
  if (item.type === "text" || item.type === "callout") {
    const m = textMetrics(ctx, item);
    const pad = 8;
    return { x: item.tx - pad, y: item.ty - pad, w: m.width + pad * 2, h: m.height + pad * 2 };
  }
  return { x: 0, y: 0, w: 0, h: 0 };
}

function hitTest(ctx, annotations, point) {
  for (let i = annotations.length - 1; i >= 0; i -= 1) {
    const item = annotations[i];
    if (item.type === "rect") {
      const pad = 8;
      if (
        point.x >= item.x - pad &&
        point.x <= item.x + item.w + pad &&
        point.y >= item.y - pad &&
        point.y <= item.y + item.h + pad
      ) {
        return item;
      }
    } else if (item.type === "circle") {
      if (Math.abs(dist(point, { x: item.cx, y: item.cy }) - item.r) <= 12 || dist(point, { x: item.cx, y: item.cy }) <= item.r) {
        return item;
      }
    } else if (item.type === "arrow") {
      if (pointNearSegment(point, { x: item.x1, y: item.y1 }, { x: item.x2, y: item.y2 }, 12)) return item;
    } else if (item.type === "text") {
      const b = annotationBounds(ctx, item);
      if (point.x >= b.x && point.x <= b.x + b.w && point.y >= b.y && point.y <= b.y + b.h) return item;
    } else if (item.type === "callout") {
      const b = annotationBounds(ctx, item);
      if (point.x >= b.x && point.x <= b.x + b.w && point.y >= b.y && point.y <= b.y + b.h) return item;
      if (dist(point, { x: item.ax, y: item.ay }) <= 12) return item;
      if (pointNearSegment(point, { x: item.tx, y: item.ty }, { x: item.ax, y: item.ay }, 10)) return item;
    }
  }
  return null;
}

function getHandle(item, point) {
  const b = item.type === "rect" ? { x: item.x, y: item.y, w: item.w, h: item.h } : null;
  if (!b) {
    if (item.type === "circle") {
      const edge = { x: item.cx + item.r, y: item.cy };
      if (dist(point, edge) <= 12) return "resize";
    }
    if (item.type === "arrow") {
      if (dist(point, { x: item.x1, y: item.y1 }) <= 12) return "start";
      if (dist(point, { x: item.x2, y: item.y2 }) <= 12) return "end";
    }
    if (item.type === "callout") {
      if (dist(point, { x: item.ax, y: item.ay }) <= 12) return "anchor";
      if (dist(point, { x: item.tx, y: item.ty }) <= 12) return "text";
    }
    return null;
  }
  const corners = [
    { name: "nw", x: b.x, y: b.y },
    { name: "ne", x: b.x + b.w, y: b.y },
    { name: "sw", x: b.x, y: b.y + b.h },
    { name: "se", x: b.x + b.w, y: b.y + b.h },
  ];
  for (const corner of corners) {
    if (dist(point, corner) <= 12) return corner.name;
  }
  return null;
}

function drawArrow(ctx, x1, y1, x2, y2, color, stroke) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = stroke;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 16;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - 0.45), y2 - head * Math.sin(angle - 0.45));
  ctx.lineTo(x2 - head * Math.cos(angle + 0.45), y2 - head * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
}

function drawTextBox(ctx, x, y, text, color, size, preview = false) {
  ctx.font = `700 ${size}px Segoe UI`;
  const metrics = ctx.measureText(text);
  const pad = 8;
  const boxW = metrics.width + pad * 2;
  const boxH = size + pad * 2;
  if (preview) ctx.setLineDash([6, 4]);
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillRect(x - pad, y - pad, boxW, boxH);
  ctx.strokeRect(x - pad, y - pad, boxW, boxH);
  ctx.setLineDash([]);
  ctx.fillStyle = "#17202a";
  ctx.fillText(text, x, y + size - 4);
}

function drawAnnotation(ctx, item, preview = false, selected = false) {
  const color = item.color || "#1e88e5";
  const stroke = item.stroke || 4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = stroke;
  if (preview) ctx.setLineDash([8, 6]);

  if (item.type === "rect") {
    ctx.strokeRect(item.x, item.y, item.w, item.h);
  } else if (item.type === "circle") {
    ctx.beginPath();
    ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (item.type === "arrow") {
    drawArrow(ctx, item.x1, item.y1, item.x2, item.y2, color, stroke);
  } else if (item.type === "text") {
    drawTextBox(ctx, item.tx, item.ty, item.text || "", color, item.size || 22, preview);
  } else if (item.type === "callout") {
    ctx.beginPath();
    ctx.moveTo(item.tx, item.ty + 12);
    ctx.lineTo(item.ax, item.ay);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(item.ax, item.ay, 6, 0, Math.PI * 2);
    ctx.fill();
    drawTextBox(ctx, item.tx, item.ty, item.text || "", color, item.size || 22, preview);
  }

  if (selected) {
    const b = annotationBounds(ctx, item);
    ctx.setLineDash([]);
    ctx.strokeStyle = "#ff6f00";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
    const handles = [
      [b.x, b.y],
      [b.x + b.w, b.y],
      [b.x, b.y + b.h],
      [b.x + b.w, b.y + b.h],
    ];
    handles.forEach(([hx, hy]) => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(hx - 5, hy - 5, 10, 10);
      ctx.strokeRect(hx - 5, hy - 5, 10, 10);
    });
  }
  ctx.restore();
}

function createCanvasEditor(canvas, paletteEl, onChange) {
  const ctx = canvas.getContext("2d");
  const state = {
    tool: "select",
    color: "#1e88e5",
    stroke: 4,
    annotations: [],
    selectedId: null,
    drawing: false,
    start: null,
    preview: null,
    drag: null,
    calloutText: "",
  };

  function setAnnotations(items) {
    state.annotations = (items || []).map((item) => ({ ...item, id: item.id || annotationId() }));
    state.selectedId = null;
    redraw();
  }

  function getAnnotations() {
    return state.annotations.map(({ id, ...rest }) => ({ id, ...rest }));
  }

  function selected() {
    return state.annotations.find((item) => item.id === state.selectedId) || null;
  }

  function redraw(bgImage = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgImage) ctx.drawImage(bgImage, 0, 0);
    state.annotations.forEach((item) => drawAnnotation(ctx, item, false, item.id === state.selectedId));
    if (state.preview) drawAnnotation(ctx, state.preview, true, false);
    renderPalette();
  }

  function renderPalette() {
    if (!paletteEl) return;
    const item = selected();
    paletteEl.innerHTML = RAINBOW_COLORS.map(
      (color) =>
        `<button type="button" class="color-swatch${item?.color === color ? " is-active" : ""}" data-color="${color}" style="background:${color}" title="${color}"></button>`
    ).join("");
    paletteEl.querySelectorAll(".color-swatch").forEach((button) => {
      button.addEventListener("click", () => {
        const color = button.dataset.color;
        state.color = color;
        const current = selected();
        if (current) {
          current.color = color;
          onChange(getAnnotations());
        }
        redraw(window.__canvasBgImage || null);
      });
    });
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  function finishChange() {
    onChange(getAnnotations());
    redraw(window.__canvasBgImage || null);
  }

  canvas.addEventListener("mousedown", (event) => {
    const point = canvasPoint(event);
    if (state.tool === "select") {
      const item = hitTest(ctx, state.annotations, point);
      if (item) {
        state.selectedId = item.id;
        const handle = getHandle(item, point);
        state.drag = { mode: handle || "move", item, start: point, origin: JSON.parse(JSON.stringify(item)) };
      } else {
        state.selectedId = null;
      }
      redraw(window.__canvasBgImage || null);
      return;
    }

    if (state.tool === "text") {
      const text = prompt("Текст:", "Нажать здесь");
      if (!text) return;
      state.annotations.push({
        id: annotationId(),
        type: "text",
        tx: point.x,
        ty: point.y,
        text,
        color: state.color,
        size: 22,
        stroke: state.stroke,
      });
      finishChange();
      return;
    }

    if (state.tool === "callout") {
      const text = prompt("Текст сноски:", "Здесь");
      if (!text) return;
      state.calloutText = text;
      state.drawing = true;
      state.start = point;
      state.preview = { type: "callout", tx: point.x, ty: point.y, ax: point.x, ay: point.y, text, color: state.color, size: 22 };
      return;
    }

    state.drawing = true;
    state.start = point;
    state.preview = null;
  });

  canvas.addEventListener("mousemove", (event) => {
    const point = canvasPoint(event);
    if (state.drag) {
      const { mode, item, start, origin } = state.drag;
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      if (mode === "move") {
        if (origin.type === "rect") {
          item.x = origin.x + dx;
          item.y = origin.y + dy;
        } else if (origin.type === "circle") {
          item.cx = origin.cx + dx;
          item.cy = origin.cy + dy;
        } else if (origin.type === "arrow") {
          item.x1 = origin.x1 + dx;
          item.y1 = origin.y1 + dy;
          item.x2 = origin.x2 + dx;
          item.y2 = origin.y2 + dy;
        } else if (origin.type === "text") {
          item.tx = origin.tx + dx;
          item.ty = origin.ty + dy;
        } else if (origin.type === "callout") {
          item.tx = origin.tx + dx;
          item.ty = origin.ty + dy;
          item.ax = origin.ax + dx;
          item.ay = origin.ay + dy;
        }
      } else if (origin.type === "rect" && ["nw", "ne", "sw", "se"].includes(mode)) {
        let x1 = origin.x;
        let y1 = origin.y;
        let x2 = origin.x + origin.w;
        let y2 = origin.y + origin.h;
        if (mode.includes("n")) y1 = origin.y + dy;
        if (mode.includes("s")) y2 = origin.y + origin.h + dy;
        if (mode.includes("w")) x1 = origin.x + dx;
        if (mode.includes("e")) x2 = origin.x + origin.w + dx;
        item.x = Math.min(x1, x2);
        item.y = Math.min(y1, y2);
        item.w = Math.abs(x2 - x1);
        item.h = Math.abs(y2 - y1);
      } else if (origin.type === "circle" && mode === "resize") {
        item.r = Math.max(8, dist(point, { x: origin.cx, y: origin.cy }));
      } else if (origin.type === "arrow") {
        if (mode === "start") {
          item.x1 = point.x;
          item.y1 = point.y;
        } else if (mode === "end") {
          item.x2 = point.x;
          item.y2 = point.y;
        }
      } else if (origin.type === "callout") {
        if (mode === "anchor") {
          item.ax = point.x;
          item.ay = point.y;
        } else if (mode === "text") {
          item.tx = point.x;
          item.ty = point.y;
        }
      }
      redraw(window.__canvasBgImage || null);
      return;
    }

    if (!state.drawing || !state.start) return;
    const start = state.start;
    if (state.tool === "arrow") {
      state.preview = { type: "arrow", x1: start.x, y1: start.y, x2: point.x, y2: point.y, color: state.color, stroke: state.stroke };
    } else if (state.tool === "rect") {
      state.preview = {
        type: "rect",
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        w: Math.abs(point.x - start.x),
        h: Math.abs(point.y - start.y),
        color: state.color,
        stroke: state.stroke,
      };
    } else if (state.tool === "circle") {
      state.preview = {
        type: "circle",
        cx: start.x,
        cy: start.y,
        r: Math.hypot(point.x - start.x, point.y - start.y),
        color: state.color,
        stroke: state.stroke,
      };
    } else if (state.tool === "callout" && state.preview) {
      state.preview.ax = point.x;
      state.preview.ay = point.y;
    }
    redraw(window.__canvasBgImage || null);
  });

  canvas.addEventListener("mouseup", (event) => {
    if (state.drag) {
      state.drag = null;
      finishChange();
      return;
    }
    if (!state.drawing || !state.start) return;
    const point = canvasPoint(event);
    const start = state.start;
    state.drawing = false;
    state.start = null;

    if (state.tool === "arrow" && (Math.abs(point.x - start.x) > 8 || Math.abs(point.y - start.y) > 8)) {
      state.annotations.push({
        id: annotationId(),
        type: "arrow",
        x1: start.x,
        y1: start.y,
        x2: point.x,
        y2: point.y,
        color: state.color,
        stroke: state.stroke,
      });
    } else if (state.tool === "rect" && (Math.abs(point.x - start.x) > 8 || Math.abs(point.y - start.y) > 8)) {
      state.annotations.push({
        id: annotationId(),
        type: "rect",
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        w: Math.abs(point.x - start.x),
        h: Math.abs(point.y - start.y),
        color: state.color,
        stroke: state.stroke,
      });
    } else if (state.tool === "circle" && Math.hypot(point.x - start.x, point.y - start.y) > 8) {
      state.annotations.push({
        id: annotationId(),
        type: "circle",
        cx: start.x,
        cy: start.y,
        r: Math.hypot(point.x - start.x, point.y - start.y),
        color: state.color,
        stroke: state.stroke,
      });
    } else if (state.tool === "callout" && state.preview) {
      state.annotations.push({
        id: annotationId(),
        type: "callout",
        tx: state.preview.tx,
        ty: state.preview.ty,
        ax: point.x,
        ay: point.y,
        text: state.calloutText,
        color: state.color,
        size: 22,
        stroke: state.stroke,
      });
    }

    state.preview = null;
    finishChange();
  });

  document.addEventListener("keydown", (event) => {
    if (!canvas.isConnected) return;
    if ((event.key === "Delete" || event.key === "Backspace") && state.selectedId) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      state.annotations = state.annotations.filter((item) => item.id !== state.selectedId);
      state.selectedId = null;
      finishChange();
    }
  });

  return {
    setTool(tool) {
      state.tool = tool;
      state.selectedId = null;
      redraw(window.__canvasBgImage || null);
    },
    setColor(color) {
      state.color = color;
      const item = selected();
      if (item) {
        item.color = color;
        finishChange();
      }
    },
    setAnnotations,
    getAnnotations,
    redraw,
    deleteSelected() {
      if (!state.selectedId) return;
      state.annotations = state.annotations.filter((item) => item.id !== state.selectedId);
      state.selectedId = null;
      finishChange();
    },
    clearAll() {
      state.annotations = [];
      state.selectedId = null;
      finishChange();
    },
    undo() {
      state.annotations.pop();
      state.selectedId = null;
      finishChange();
    },
    getSelectedId: () => state.selectedId,
    colors: RAINBOW_COLORS,
  };
}

window.RAINBOW_COLORS = RAINBOW_COLORS;
window.createCanvasEditor = createCanvasEditor;
