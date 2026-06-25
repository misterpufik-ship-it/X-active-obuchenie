const state = {
  projects: [],
  project: null,
  selectedStepId: null,
  tool: "arrow",
  drawing: false,
  startPoint: null,
  previewItem: null,
  pollTimer: null,
};

const nodes = {
  projectList: document.querySelector("#project-list"),
  emptyState: document.querySelector("#empty-state"),
  editor: document.querySelector("#editor"),
  projectTopic: document.querySelector("#project-topic"),
  projectTitle: document.querySelector("#project-title"),
  fieldTopic: document.querySelector("#field-topic"),
  fieldRole: document.querySelector("#field-role"),
  fieldDescription: document.querySelector("#field-description"),
  projectStatus: document.querySelector("#project-status"),
  statusMessage: document.querySelector("#status-message"),
  stepsCount: document.querySelector("#steps-count"),
  stepsList: document.querySelector("#steps-list"),
  stepEditorTitle: document.querySelector("#step-editor-title"),
  stepTitle: document.querySelector("#step-title"),
  stepAction: document.querySelector("#step-action"),
  stepComment: document.querySelector("#step-comment"),
  stepResult: document.querySelector("#step-result"),
  frameSelect: document.querySelector("#frame-select"),
  canvas: document.querySelector("#annotation-canvas"),
  snippetDialog: document.querySelector("#snippet-dialog"),
  snippetOutput: document.querySelector("#snippet-output"),
};

const ctx = nodes.canvas.getContext("2d");
let bgImage = null;
let saveTimer = null;

async function api(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    let message = "Ошибка запроса";
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) return response.json();
  return response.blob();
}

function selectedStep() {
  return state.project?.steps?.find((step) => step.id === state.selectedStepId) || null;
}

function fileUrl(relPath) {
  return `/api/projects/${state.project.id}/files/${relPath}?t=${Date.now()}`;
}

function scheduleSaveProject() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProjectMeta, 500);
}

function scheduleSaveStep() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveStepFields, 400);
}

async function loadProjects() {
  state.projects = await api("/api/projects");
  renderProjectList();
}

function renderProjectList() {
  if (!state.projects.length) {
    nodes.projectList.innerHTML = `<p class="hint-card">Проектов пока нет.</p>`;
    return;
  }

  nodes.projectList.innerHTML = state.projects
    .map((project) => {
      const active = state.project?.id === project.id ? " is-active" : "";
      return `<button class="project-item${active}" type="button" data-id="${project.id}">
        <strong>${escapeHtml(project.title)}</strong>
        <small>${escapeHtml(project.topic)} · ${project.stepsCount} шагов · ${project.status}</small>
      </button>`;
    })
    .join("");

  nodes.projectList.querySelectorAll(".project-item").forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.id));
  });
}

async function openProject(projectId) {
  stopPolling();
  state.project = await api(`/api/projects/${projectId}`);
  state.selectedStepId = state.project.steps?.[0]?.id || null;
  nodes.emptyState.classList.add("hidden");
  nodes.editor.classList.remove("hidden");
  renderEditor();
  if (state.project.status === "processing") startPolling();
  await loadProjects();
}

function renderEditor() {
  const project = state.project;
  nodes.projectTopic.textContent = project.topic || "Без темы";
  nodes.projectTitle.value = project.title || "";
  nodes.fieldTopic.value = project.topic || "";
  nodes.fieldRole.value = project.role || "";
  nodes.fieldDescription.value = project.description || "";
  nodes.projectStatus.textContent = project.status || "draft";
  nodes.statusMessage.textContent = project.statusMessage || "";
  nodes.stepsCount.textContent = String(project.steps?.length || 0);

  renderStepsList();
  renderFrameSelect();
  renderStepEditor();
}

function renderStepsList() {
  const steps = state.project.steps || [];
  if (!steps.length) {
    nodes.stepsList.innerHTML = `<p class="status-text">Шаги появятся после обработки видео.</p>`;
    return;
  }

  nodes.stepsList.innerHTML = steps
    .map((step) => {
      const active = step.id === state.selectedStepId ? " is-active" : "";
      return `<button class="step-card-btn${active}" type="button" data-step="${step.id}">
        <strong>${step.number}. ${escapeHtml(step.title)}</strong>
        <span>${escapeHtml(truncate(step.action, 72))}</span>
      </button>`;
    })
    .join("");

  nodes.stepsList.querySelectorAll(".step-card-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await persistStepFields();
      state.selectedStepId = button.dataset.step;
      renderStepEditor();
      renderStepsList();
    });
  });
}

function renderFrameSelect() {
  const frames = state.project.availableFrames || [];
  nodes.frameSelect.innerHTML = frames
    .map((frame) => `<option value="${frame.file}">${frame.time}s — ${frame.file.split("/").pop()}</option>`)
    .join("");
}

async function renderStepEditor() {
  const step = selectedStep();
  if (!step) {
    nodes.stepEditorTitle.textContent = "Шаг не выбран";
    ctx.clearRect(0, 0, nodes.canvas.width, nodes.canvas.height);
    return;
  }

  nodes.stepEditorTitle.textContent = `Шаг ${step.number}`;
  nodes.stepTitle.value = step.title || "";
  nodes.stepAction.value = step.action || "";
  nodes.stepComment.value = step.comment || "";
  nodes.stepResult.value = step.result || "";

  if (step.frameFile) {
    nodes.frameSelect.value = step.frameFile;
  }

  await loadCanvasImage(step);
  redrawCanvas();
}

async function loadCanvasImage(step) {
  if (!step.frameFile) {
    bgImage = null;
    nodes.canvas.width = 960;
    nodes.canvas.height = 540;
    ctx.fillStyle = "#f4f7fa";
    ctx.fillRect(0, 0, nodes.canvas.width, nodes.canvas.height);
    ctx.fillStyle = "#65717f";
    ctx.font = "18px Segoe UI";
    ctx.fillText("Скриншот не назначен", 36, 48);
    return;
  }

  await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      bgImage = image;
      nodes.canvas.width = image.width;
      nodes.canvas.height = image.height;
      resolve();
    };
    image.onerror = reject;
    image.src = fileUrl(step.frameFile);
  });
}

function redrawCanvas() {
  const step = selectedStep();
  ctx.clearRect(0, 0, nodes.canvas.width, nodes.canvas.height);
  if (bgImage) ctx.drawImage(bgImage, 0, 0);

  (step?.annotations || []).forEach((item) => drawAnnotation(item));
  if (state.previewItem) drawAnnotation(state.previewItem, true);
}

function drawAnnotation(item, preview = false) {
  ctx.save();
  ctx.strokeStyle = item.color || "#0076ff";
  ctx.fillStyle = item.color || "#0076ff";
  ctx.lineWidth = item.stroke || 4;
  if (preview) ctx.setLineDash([8, 6]);

  if (item.type === "rect") {
    ctx.strokeRect(item.x, item.y, item.w, item.h);
  } else if (item.type === "circle") {
    ctx.beginPath();
    ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (item.type === "arrow") {
    drawArrow(item.x1, item.y1, item.x2, item.y2);
  } else if (item.type === "text") {
    ctx.font = `700 ${item.size || 22}px Segoe UI`;
    const text = item.text || "";
    const metrics = ctx.measureText(text);
    const pad = 8;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(item.x - pad, item.y - pad, metrics.width + pad * 2, 28 + pad);
    ctx.strokeStyle = item.color || "#0076ff";
    ctx.strokeRect(item.x - pad, item.y - pad, metrics.width + pad * 2, 28 + pad);
    ctx.fillStyle = "#17202a";
    ctx.fillText(text, item.x, item.y + 20);
  }
  ctx.restore();
}

function drawArrow(x1, y1, x2, y2) {
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

function canvasPoint(event) {
  const rect = nodes.canvas.getBoundingClientRect();
  const scaleX = nodes.canvas.width / rect.width;
  const scaleY = nodes.canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

nodes.canvas.addEventListener("mousedown", (event) => {
  const step = selectedStep();
  if (!step || !bgImage) return;
  const point = canvasPoint(event);

  if (state.tool === "text") {
    const text = prompt("Текст пометки:", "Нажать");
    if (!text) return;
    step.annotations.push({ type: "text", x: point.x, y: point.y, text, color: "#0076ff", size: 22 });
    persistStepFields();
    redrawCanvas();
    return;
  }

  if (state.tool === "select") return;

  state.drawing = true;
  state.startPoint = point;
  state.previewItem = null;
});

nodes.canvas.addEventListener("mousemove", (event) => {
  if (!state.drawing || !state.startPoint) return;
  const point = canvasPoint(event);
  const start = state.startPoint;

  if (state.tool === "arrow") {
    state.previewItem = { type: "arrow", x1: start.x, y1: start.y, x2: point.x, y2: point.y, color: "#0076ff", stroke: 4 };
  } else if (state.tool === "rect") {
    state.previewItem = {
      type: "rect",
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      w: Math.abs(point.x - start.x),
      h: Math.abs(point.y - start.y),
      color: "#0076ff",
      stroke: 4,
    };
  } else if (state.tool === "circle") {
    const radius = Math.hypot(point.x - start.x, point.y - start.y);
    state.previewItem = { type: "circle", cx: start.x, cy: start.y, r: radius, color: "#0076ff", stroke: 4 };
  }
  redrawCanvas();
});

nodes.canvas.addEventListener("mouseup", (event) => {
  const step = selectedStep();
  if (!state.drawing || !step || !state.startPoint) return;
  const point = canvasPoint(event);
  const start = state.startPoint;
  state.drawing = false;
  state.startPoint = null;

  if (state.tool === "arrow" && (Math.abs(point.x - start.x) > 8 || Math.abs(point.y - start.y) > 8)) {
    step.annotations.push({ type: "arrow", x1: start.x, y1: start.y, x2: point.x, y2: point.y, color: "#0076ff", stroke: 4 });
  } else if (state.tool === "rect" && (Math.abs(point.x - start.x) > 8 || Math.abs(point.y - start.y) > 8)) {
    step.annotations.push({
      type: "rect",
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      w: Math.abs(point.x - start.x),
      h: Math.abs(point.y - start.y),
      color: "#0076ff",
      stroke: 4,
    });
  } else if (state.tool === "circle" && Math.hypot(point.x - start.x, point.y - start.y) > 8) {
    step.annotations.push({
      type: "circle",
      cx: start.x,
      cy: start.y,
      r: Math.hypot(point.x - start.x, point.y - start.y),
      color: "#0076ff",
      stroke: 4,
    });
  }

  state.previewItem = null;
  persistStepFields();
  redrawCanvas();
});

document.querySelectorAll(".tool-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tool-btn").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    state.tool = button.dataset.tool;
  });
});

document.querySelector("#undo-annotation").addEventListener("click", () => {
  const step = selectedStep();
  if (!step?.annotations?.length) return;
  step.annotations.pop();
  persistStepFields();
  redrawCanvas();
});

document.querySelector("#clear-annotations").addEventListener("click", () => {
  const step = selectedStep();
  if (!step) return;
  if (!confirm("Очистить все пометки на этом шаге?")) return;
  step.annotations = [];
  persistStepFields();
  redrawCanvas();
});

async function saveProjectMeta() {
  if (!state.project) return;
  state.project.title = nodes.projectTitle.value.trim();
  state.project.topic = nodes.fieldTopic.value.trim();
  state.project.role = nodes.fieldRole.value.trim();
  state.project.description = nodes.fieldDescription.value.trim();
  state.project = await api(`/api/projects/${state.project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: state.project.title,
      topic: state.project.topic,
      role: state.project.role,
      description: state.project.description,
    }),
  });
  renderProjectList();
}

async function persistStepFields() {
  if (!state.project) return;
  const step = selectedStep();
  if (step) {
    step.title = nodes.stepTitle.value.trim();
    step.action = nodes.stepAction.value.trim();
    step.comment = nodes.stepComment.value.trim();
    step.result = nodes.stepResult.value.trim();
  }
  state.project = await api(`/api/projects/${state.project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ steps: state.project.steps }),
  });
  renderStepsList();
}

async function saveStepFields() {
  await persistStepFields();
}

[nodes.projectTitle, nodes.fieldTopic, nodes.fieldRole, nodes.fieldDescription].forEach((node) => {
  node.addEventListener("input", scheduleSaveProject);
});

[nodes.stepTitle, nodes.stepAction, nodes.stepComment, nodes.stepResult].forEach((node) => {
  node.addEventListener("input", scheduleSaveStep);
});

document.querySelector("#new-project").addEventListener("click", async () => {
  const title = prompt("Название урока:", "Новый урок");
  if (!title) return;
  const topic = prompt("Тема:", "Поставки WB") || "Без темы";
  const project = await api("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, topic }),
  });
  await loadProjects();
  await openProject(project.id);
});

document.querySelector("#upload-video").addEventListener("click", async () => {
  const input = document.querySelector("#video-input");
  const file = input.files?.[0];
  if (!file || !state.project) {
    alert("Выберите видеофайл.");
    return;
  }
  const form = new FormData();
  form.append("video", file);
  const response = await fetch(`/api/projects/${state.project.id}/upload`, { method: "POST", body: form });
  if (!response.ok) {
    const payload = await response.json();
    alert(payload.error || "Не удалось загрузить видео.");
    return;
  }
  state.project = await response.json();
  renderEditor();
});

document.querySelector("#process-video").addEventListener("click", async () => {
  if (!state.project) return;
  try {
    await api(`/api/projects/${state.project.id}/process`, { method: "POST" });
    state.project.status = "processing";
    renderEditor();
    startPolling();
  } catch (error) {
    alert(error.message);
  }
});

document.querySelector("#apply-frame").addEventListener("click", async () => {
  const step = selectedStep();
  if (!step) return;
  step.frameFile = nodes.frameSelect.value;
  step.annotations = [];
  await persistStepFields();
  await renderStepEditor();
});

async function downloadExport(path, filename) {
  const blob = await api(path, { method: "POST" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#export-html").addEventListener("click", () => {
  if (!state.project) return;
  downloadExport(`/api/projects/${state.project.id}/export/html`, "instruction.html");
});

document.querySelector("#export-pdf").addEventListener("click", () => {
  if (!state.project) return;
  downloadExport(`/api/projects/${state.project.id}/export/pdf`, "instruction.pdf");
});

document.querySelector("#export-snippet").addEventListener("click", async () => {
  if (!state.project) return;
  const payload = await api(`/api/projects/${state.project.id}/export/snippet`);
  nodes.snippetOutput.value = payload.snippet;
  nodes.snippetDialog.showModal();
});

document.querySelector("#copy-snippet").addEventListener("click", async (event) => {
  event.preventDefault();
  await navigator.clipboard.writeText(nodes.snippetOutput.value);
});

function startPolling() {
  stopPolling();
  state.pollTimer = setInterval(async () => {
    if (!state.project) return;
    const fresh = await api(`/api/projects/${state.project.id}`);
    const wasProcessing = state.project.status === "processing";
    state.project = fresh;
    renderEditor();
    if (wasProcessing && fresh.status !== "processing") {
      stopPolling();
      if (fresh.status === "ready" && fresh.steps?.length) {
        state.selectedStepId = fresh.steps[0].id;
        await renderStepEditor();
      }
    }
  }, 2500);
}

function stopPolling() {
  if (state.pollTimer) clearInterval(state.pollTimer);
  state.pollTimer = null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function truncate(value, max) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

loadProjects();
