const SITE_LOCAL_URL = "http://127.0.0.1:8000/site/";
const SITE_ONLINE_URL = "https://nostradamus-1503.ru/obuchenie/";

function appRoot() {
  const path = window.location.pathname.replace(/\/$/, "") || "";
  if (!path || path === "/") return "";
  return path;
}

function appUrl(path) {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${appRoot()}${suffix}`;
}

function siteHomeUrl() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? SITE_LOCAL_URL
    : SITE_ONLINE_URL;
}

function stepId() {
  return `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function frameId() {
  return `frame-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const state = {
  projects: [],
  project: null,
  selectedStepId: null,
  selectedFrameId: null,
  pollTimer: null,
  activeColor: "#1e88e5",
};

const nodes = {
  projectList: document.querySelector("#project-list"),
  emptyState: document.querySelector("#empty-state"),
  editor: document.querySelector("#editor"),
  projectTopic: document.querySelector("#project-topic"),
  projectTitle: document.querySelector("#project-title"),
  fieldTopic: document.querySelector("#field-topic"),
  fieldRole: document.querySelector("#field-role"),
  fieldDuration: document.querySelector("#field-duration"),
  fieldDescription: document.querySelector("#field-description"),
  fieldVideoNote: document.querySelector("#field-video-note"),
  fieldKeywords: document.querySelector("#field-keywords"),
  fieldChecklist: document.querySelector("#field-checklist"),
  fieldIssues: document.querySelector("#field-issues"),
  projectStatus: document.querySelector("#project-status"),
  statusMessage: document.querySelector("#status-message"),
  stepsCount: document.querySelector("#steps-count"),
  stepsList: document.querySelector("#steps-list"),
  stepEditorTitle: document.querySelector("#step-editor-title"),
  stepTitle: document.querySelector("#step-title"),
  stepWhy: document.querySelector("#step-why"),
  stepAction: document.querySelector("#step-action"),
  stepComment: document.querySelector("#step-comment"),
  stepResult: document.querySelector("#step-result"),
  frameSelect: document.querySelector("#frame-select"),
  stepFramesStrip: document.querySelector("#step-frames-strip"),
  canvas: document.querySelector("#annotation-canvas"),
  colorToolbar: document.querySelector("#color-toolbar"),
  colorPalette: document.querySelector("#color-palette"),
  paletteRow: document.querySelector("#palette-row"),
  snippetDialog: document.querySelector("#snippet-dialog"),
  snippetOutput: document.querySelector("#snippet-output"),
  appShell: document.querySelector("#app-shell"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  sidebarRestore: document.querySelector("#sidebar-restore"),
  annotationDock: document.querySelector("#annotation-dock"),
  canvasWrap: document.querySelector("#canvas-wrap"),
  canvasExpand: document.querySelector("#canvas-expand"),
  canvasPlaceholder: document.querySelector("#canvas-placeholder"),
  canvasLightbox: document.querySelector("#canvas-lightbox"),
  canvasLightboxInner: document.querySelector("#canvas-lightbox-inner"),
  canvasLightboxClose: document.querySelector("#canvas-lightbox-close"),
  canvasPlaceholderClose: document.querySelector("#canvas-placeholder-close"),
  publishButton: document.querySelector("#publish-project"),
};

let bgImage = null;
let saveTimer = null;
let canvasEditor = null;
let annotationDockParent = null;
let annotationDockNext = null;

function initCanvasEditor() {
  if (canvasEditor) return canvasEditor;
  canvasEditor = createCanvasEditor(
    nodes.canvas,
    nodes.colorPalette,
    (annotations) => {
      const frame = selectedStepFrame();
      if (!frame) return;
      frame.annotations = annotations;
      scheduleSaveStep();
    },
    {
      onSelectionChange: () => updatePaletteVisibility(),
      onRequestSelectTool: () => activateTool("select"),
    }
  );
  canvasEditor.setColor(state.activeColor);
  return canvasEditor;
}

function activateTool(tool) {
  document.querySelectorAll(".tool-btn").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.tool === tool);
  });
  initCanvasEditor().setTool(tool);
  nodes.canvas.classList.toggle("tool-select", tool === "select");
  updatePaletteVisibility();
}

function updatePaletteVisibility() {
  const hasSelection = Boolean(canvasEditor?.getSelectedId?.());
  nodes.paletteRow.classList.toggle("is-visible", hasSelection);
}

function renderColorToolbar() {
  const colors = window.RAINBOW_COLORS || [];
  nodes.colorToolbar.innerHTML = colors
    .map(
      (color) =>
        `<button type="button" class="color-swatch${state.activeColor === color ? " is-active" : ""}" data-color="${color}" style="background:${color}" title="${color}"></button>`
    )
    .join("");
  nodes.colorToolbar.querySelectorAll(".color-swatch").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeColor = button.dataset.color;
      canvasEditor?.setColor(state.activeColor);
      renderColorToolbar();
    });
  });
}

async function api(path, options = {}) {
  const response = await fetch(appUrl(path), options);
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

function normalizeStepFrames(step) {
  if (!step) return [];
  if (Array.isArray(step.frames) && step.frames.length) {
    return step.frames;
  }
  if (step.frameFile) {
    step.frames = [
      {
        id: step.frameId || frameId(),
        frameFile: step.frameFile,
        annotations: step.annotations || [],
      },
    ];
    return step.frames;
  }
  step.frames = step.frames || [];
  return step.frames;
}

function selectedStepFrame(step = selectedStep()) {
  const frames = normalizeStepFrames(step);
  if (!frames.length) return null;
  return frames.find((frame) => frame.id === state.selectedFrameId) || frames[0];
}

function stepFrameCount(step) {
  return normalizeStepFrames(step).length;
}

function syncStepLegacyFields(step) {
  const frames = normalizeStepFrames(step);
  if (frames.length) {
    step.frameFile = frames[0].frameFile;
    step.annotations = frames[0].annotations || [];
  } else {
    step.frameFile = "";
    step.annotations = [];
  }
}

function addStepFrame(step, frameFile) {
  const frames = normalizeStepFrames(step);
  const frame = { id: frameId(), frameFile, annotations: [] };
  frames.push(frame);
  state.selectedFrameId = frame.id;
  syncStepLegacyFields(step);
  return frame;
}

function fileUrl(relPath) {
  return appUrl(`/api/projects/${state.project.id}/files/${relPath}?t=${Date.now()}`);
}

function scheduleSaveProject() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveProjectMeta, 500);
}

function scheduleSaveStep() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveStepFields, 400);
}

function linesToList(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(value) {
  return (value || []).join("\n");
}

function issuesToLines(issues) {
  return (issues || [])
    .map((item) => {
      if (typeof item === "string") return item;
      return `${item.title || ""} | ${item.text || ""}`.trim();
    })
    .join("\n");
}

function linesToIssues(value) {
  return linesToList(value).map((line) => {
    const [title, ...rest] = line.split("|");
    return { title: title.trim(), text: rest.join("|").trim() };
  });
}

function renumberSteps() {
  (state.project.steps || []).forEach((step, index) => {
    step.number = index + 1;
  });
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
  await flushPendingSave();
  state.project = await api(`/api/projects/${projectId}`);
  state.selectedStepId = state.project.steps?.[0]?.id || null;
  state.selectedFrameId = selectedStepFrame(state.project.steps?.[0])?.id || null;
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
  nodes.fieldDuration.value = project.duration || "";
  nodes.fieldDescription.value = project.description || "";
  nodes.fieldVideoNote.value = project.videoNote || "";
  nodes.fieldKeywords.value = (project.keywords || []).join(", ");
  nodes.fieldChecklist.value = listToLines(project.checklist);
  nodes.fieldIssues.value = issuesToLines(project.issues);
  nodes.projectStatus.textContent = project.status || "draft";
  nodes.statusMessage.textContent = project.statusMessage || "";
  nodes.stepsCount.textContent = String(project.steps?.length || 0);

  renderStepsList();
  renderFrameSelect();
  void renderStepEditor();
}

function renderStepsList() {
  const steps = state.project.steps || [];
  if (!steps.length) {
    nodes.stepsList.innerHTML = `<p class="status-text">Добавьте шаг вручную или запустите обработку видео.</p>`;
    return;
  }

  nodes.stepsList.innerHTML = steps
    .map((step) => {
      const active = step.id === state.selectedStepId ? " is-active" : "";
      const frameCount = stepFrameCount(step);
      const shots = frameCount ? ` · ${frameCount} скрин.` : "";
      return `<button class="step-card-btn${active}" type="button" data-step="${step.id}">
        <strong>${step.number}. ${escapeHtml(step.title)}</strong>
        <span>${escapeHtml(truncate(step.action, 72))}${shots}</span>
      </button>`;
    })
    .join("");

  nodes.stepsList.querySelectorAll(".step-card-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await flushPendingSave();
      state.selectedStepId = button.dataset.step;
      state.selectedFrameId = selectedStepFrame()?.id || null;
      renderStepEditor();
      renderStepsList();
    });
  });
}

function renderStepFramesStrip() {
  const step = selectedStep();
  const frames = normalizeStepFrames(step);
  if (!frames.length) {
    nodes.stepFramesStrip.innerHTML = "";
    nodes.stepFramesStrip.classList.add("is-empty");
    return;
  }

  nodes.stepFramesStrip.classList.remove("is-empty");
  nodes.stepFramesStrip.innerHTML = frames
    .map((frame, index) => {
      const active = frame.id === selectedStepFrame(step)?.id ? " is-active" : "";
      return `<button class="step-frame-thumb${active}" type="button" data-frame="${frame.id}" title="Скриншот ${index + 1}">
        <img src="${fileUrl(frame.frameFile)}" alt="Скриншот ${index + 1}" />
        <span>${index + 1}</span>
      </button>`;
    })
    .join("");

  nodes.stepFramesStrip.querySelectorAll(".step-frame-thumb").forEach((button) => {
    button.addEventListener("click", async () => {
      if (state.selectedFrameId === button.dataset.frame) return;
      await flushPendingSave();
      state.selectedFrameId = button.dataset.frame;
      await renderStepEditor();
    });
  });
}

function frameOptionLabel(frame) {
  const name = frame.file.split("/").pop();
  if (frame.source === "manual" || (typeof frame.time === "string" && Number.isNaN(Number(frame.time)))) {
    return `${frame.time || "вручную"} — ${name}`;
  }
  return `${frame.time}s — ${name}`;
}

function renderFrameSelect() {
  const frames = state.project.availableFrames || [];
  if (!frames.length) {
    nodes.frameSelect.innerHTML = `<option value="">Нет кадров — загрузите видео или скриншот</option>`;
    return;
  }
  nodes.frameSelect.innerHTML = frames
    .map((frame) => `<option value="${frame.file}">${frameOptionLabel(frame)}</option>`)
    .join("");
}

async function renderStepEditor() {
  const editor = initCanvasEditor();
  const step = selectedStep();
  if (!step) {
    nodes.stepEditorTitle.textContent = "Шаг не выбран";
    bgImage = null;
    window.__canvasBgImage = null;
    editor.setAnnotations([]);
    editor.redraw(null);
    return;
  }

  nodes.stepEditorTitle.textContent = `Шаг ${step.number} · скриншотов: ${normalizeStepFrames(step).length}`;
  nodes.stepTitle.value = step.title || "";
  nodes.stepWhy.value = step.why || "";
  nodes.stepAction.value = step.action || "";
  nodes.stepComment.value = step.comment || "";
  nodes.stepResult.value = step.result || "";

  renderStepFramesStrip();
  const frame = selectedStepFrame(step);
  if (frame) {
    state.selectedFrameId = frame.id;
  }

  await loadCanvasImage(frame);
  window.__canvasBgImage = bgImage;
  editor.setAnnotations(frame?.annotations || []);
  editor.redraw(bgImage);
  updatePaletteVisibility();
}

async function loadCanvasImage(frame) {
  const ctx = nodes.canvas.getContext("2d");
  if (!frame?.frameFile) {
    bgImage = null;
    nodes.canvas.width = 960;
    nodes.canvas.height = 540;
    ctx.fillStyle = "#f4f7fa";
    ctx.fillRect(0, 0, nodes.canvas.width, nodes.canvas.height);
    ctx.fillStyle = "#65717f";
    ctx.font = "18px Segoe UI";
    ctx.fillText("Добавьте скриншот: + Скриншот, Ctrl+V или кадр из видео", 36, 48);
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
    image.src = fileUrl(frame.frameFile);
  });
}

function collectProjectPayload() {
  return {
    title: nodes.projectTitle.value.trim(),
    topic: nodes.fieldTopic.value.trim(),
    role: nodes.fieldRole.value.trim(),
    duration: nodes.fieldDuration.value.trim(),
    description: nodes.fieldDescription.value.trim(),
    videoNote: nodes.fieldVideoNote.value.trim(),
    keywords: nodes.fieldKeywords.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    checklist: linesToList(nodes.fieldChecklist.value),
    issues: linesToIssues(nodes.fieldIssues.value),
    steps: state.project.steps,
  };
}

function syncStepFromForm() {
  const step = selectedStep();
  if (!step) return;
  step.title = nodes.stepTitle.value.trim();
  step.why = nodes.stepWhy.value.trim();
  step.action = nodes.stepAction.value.trim();
  step.comment = nodes.stepComment.value.trim();
  step.result = nodes.stepResult.value.trim();
  syncStepLegacyFields(step);
}

async function flushPendingSave() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (!state.project) return;
  syncStepFromForm();
  const payload = collectProjectPayload();
  Object.assign(state.project, payload);
  state.project = await api(`/api/projects/${state.project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function cancelPendingSave() {
  clearTimeout(saveTimer);
  saveTimer = null;
}

async function saveProjectMeta() {
  if (!state.project) return;
  syncStepFromForm();
  const payload = collectProjectPayload();
  Object.assign(state.project, payload);
  state.project = await api(`/api/projects/${state.project.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  renderProjectList();
  nodes.statusMessage.textContent = "Сохранено.";
}

async function saveStepFields() {
  await saveProjectMeta();
  renderStepsList();
}

document.querySelectorAll(".tool-btn").forEach((button) => {
  button.addEventListener("click", () => activateTool(button.dataset.tool));
});

document.querySelector("#undo-annotation").addEventListener("click", () => {
  initCanvasEditor().undo();
});

document.querySelector("#clear-annotations").addEventListener("click", () => {
  if (!confirm("Очистить все пометки на этом скриншоте?")) return;
  initCanvasEditor().clearAll();
});

document.querySelector("#delete-annotation").addEventListener("click", () => {
  const removed = initCanvasEditor().deleteSelected();
  updatePaletteVisibility();
  if (!removed) {
    nodes.statusMessage.textContent = "Выберите элемент на скрине (инструмент «Выбор») или кликните по нему.";
  }
});

[nodes.projectTitle, nodes.fieldTopic, nodes.fieldRole, nodes.fieldDuration, nodes.fieldDescription, nodes.fieldVideoNote, nodes.fieldKeywords, nodes.fieldChecklist, nodes.fieldIssues].forEach((node) => {
  node.addEventListener("input", scheduleSaveProject);
});

[nodes.stepTitle, nodes.stepWhy, nodes.stepAction, nodes.stepComment, nodes.stepResult].forEach((node) => {
  node.addEventListener("input", scheduleSaveStep);
});

document.querySelector("#save-project").addEventListener("click", async () => {
  try {
    await flushPendingSave();
    nodes.statusMessage.textContent = "Проект сохранён.";
  } catch (error) {
    alert(error.message);
  }
});

document.querySelector("#publish-project").addEventListener("click", async () => {
  if (!state.project || nodes.publishButton.disabled) return;
  const button = nodes.publishButton;
  const originalText = button.textContent;
  try {
    button.disabled = true;
    button.textContent = "Публикация…";
    await flushPendingSave();
    const result = await api(`/api/projects/${state.project.id}/publish`, { method: "POST" });
    state.project = await api(`/api/projects/${state.project.id}`);
    renderEditor();
    const deployNote = result.deployed ? " Сайт задеплоен." : "";
    const message = result.message || "Урок добавлен в учебную базу.";
    nodes.statusMessage.textContent = `${message}${deployNote}`;
    if (result.url) {
      const link = document.createElement("a");
      link.href = result.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = " Открыть урок";
      nodes.statusMessage.appendChild(document.createTextNode(""));
      nodes.statusMessage.appendChild(link);
    }
  } catch (error) {
    nodes.statusMessage.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
});

document.querySelector("#add-step").addEventListener("click", async () => {
  if (!state.project) return;
  await flushPendingSave();
  const number = (state.project.steps?.length || 0) + 1;
  const step = {
    id: stepId(),
    number,
    title: `Шаг ${number}`,
    why: "",
    action: "",
    comment: "",
    result: "",
    frameFile: "",
    frames: [],
    annotations: [],
  };
  const firstFrame = state.project.availableFrames?.[0]?.file;
  if (firstFrame) {
    step.frames.push({ id: frameId(), frameFile: firstFrame, annotations: [] });
    step.frameFile = firstFrame;
  }
  state.project.steps = [...(state.project.steps || []), step];
  renumberSteps();
  state.selectedStepId = step.id;
  state.selectedFrameId = step.frames[0]?.id || null;
  await saveProjectMeta();
  renderEditor();
});

document.querySelector("#delete-step").addEventListener("click", async () => {
  const step = selectedStep();
  if (!step || !confirm(`Удалить шаг ${step.number}?`)) return;
  await flushPendingSave();
  state.project.steps = state.project.steps.filter((item) => item.id !== step.id);
  renumberSteps();
  state.selectedStepId = state.project.steps[0]?.id || null;
  await saveProjectMeta();
  renderEditor();
});

document.querySelector("#move-step-up").addEventListener("click", async () => {
  await moveStep(-1);
});

document.querySelector("#move-step-down").addEventListener("click", async () => {
  await moveStep(1);
});

async function moveStep(direction) {
  const steps = state.project?.steps || [];
  const index = steps.findIndex((step) => step.id === state.selectedStepId);
  if (index < 0) return;
  const target = index + direction;
  if (target < 0 || target >= steps.length) return;
  await flushPendingSave();
  const copy = [...steps];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  state.project.steps = copy;
  renumberSteps();
  await saveProjectMeta();
  renderEditor();
}

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
  const response = await fetch(appUrl(`/api/projects/${state.project.id}/upload`), { method: "POST", body: form });
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
    await flushPendingSave();
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
  const frameFile = nodes.frameSelect.value;
  if (!frameFile) {
    alert("Нет доступных кадров.");
    return;
  }
  cancelPendingSave();
  syncStepFromForm();
  addStepFrame(step, frameFile);
  await saveStepFields();
  await renderStepEditor();
});

document.querySelector("#delete-step-frame").addEventListener("click", async () => {
  const step = selectedStep();
  const frame = selectedStepFrame(step);
  if (!step || !frame) {
    alert("Нет скриншота для удаления.");
    return;
  }
  const frames = normalizeStepFrames(step);
  if (!confirm(`Удалить скриншот ${frames.findIndex((item) => item.id === frame.id) + 1}?`)) return;
  step.frames = frames.filter((item) => item.id !== frame.id);
  syncStepLegacyFields(step);
  state.selectedFrameId = step.frames[0]?.id || null;
  await saveStepFields();
  await renderStepEditor();
});

async function uploadStepImage(file, { applyToStep = true, label = "вручную" } = {}) {
  if (!state.project || !file) return;
  const step = selectedStep();
  if (applyToStep && !step) {
    throw new Error("Сначала выберите шаг слева.");
  }

  cancelPendingSave();
  if (step) {
    syncStepFromForm();
  }

  const form = new FormData();
  const name = file.name || `screenshot-${Date.now()}.png`;
  form.append("image", file, name);
  form.append("label", label);
  if (applyToStep && step) {
    form.append("applyToStep", step.id);
  }
  const response = await fetch(appUrl(`/api/projects/${state.project.id}/upload-image`), {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || "Не удалось загрузить изображение.");
  }
  state.project = await response.json();
  const freshStep = selectedStep();
  if (applyToStep && freshStep) {
    normalizeStepFrames(freshStep);
    const newest = freshStep.frames[freshStep.frames.length - 1];
    if (newest) state.selectedFrameId = newest.id;
  }
  renderEditor();
  await renderStepEditor();
  nodes.statusMessage.textContent = state.project.statusMessage || "Скриншот добавлен.";
}

document.querySelector("#upload-image").addEventListener("click", () => {
  document.querySelector("#image-input").click();
});

document.querySelector("#image-input").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file || !state.project) return;
  try {
    nodes.statusMessage.textContent = "Загрузка изображения…";
    await uploadStepImage(file, { applyToStep: true, label: "файл" });
    nodes.statusMessage.textContent = state.project.statusMessage || "Изображение загружено.";
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("paste", handlePaste, true);
window.addEventListener("paste", handlePaste, true);

async function handlePaste(event) {
  if (!state.project || nodes.editor.classList.contains("hidden")) return;
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
    return;
  }
  const items = event.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (!file) continue;
    event.preventDefault();
    try {
      nodes.statusMessage.textContent = "Вставка из буфера…";
      await uploadStepImage(file, { applyToStep: true, label: "буфер" });
    } catch (error) {
      alert(error.message);
    }
    break;
  }
}

nodes.canvasWrap?.addEventListener("click", () => nodes.canvasWrap.focus());
nodes.stepFramesStrip?.addEventListener("click", () => nodes.stepFramesStrip.focus());
document.querySelector("#workspace")?.addEventListener("click", (event) => {
  if (event.target.closest("input, textarea, select, button, a, label")) return;
  document.querySelector("#workspace")?.focus();
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
      if (fresh.steps?.length) {
        state.selectedStepId = fresh.steps[0].id;
        state.selectedFrameId = selectedStepFrame(fresh.steps[0])?.id || null;
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

function isCanvasLightboxOpen() {
  return nodes.canvasLightbox.classList.contains("is-open");
}

function openCanvasLightbox() {
  if (!selectedStep() || isCanvasLightboxOpen()) return;
  annotationDockParent = nodes.annotationDock.parentElement;
  annotationDockNext = nodes.annotationDock.nextElementSibling;
  nodes.canvasLightboxInner.appendChild(nodes.annotationDock);
  nodes.canvasLightbox.classList.remove("hidden");
  nodes.canvasLightbox.classList.add("is-open");
  nodes.canvasPlaceholder.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  canvasEditor?.redraw(bgImage);
}

function closeCanvasLightbox() {
  if (!isCanvasLightboxOpen()) return;
  if (annotationDockParent) {
    if (annotationDockNext) {
      annotationDockParent.insertBefore(nodes.annotationDock, annotationDockNext);
    } else {
      annotationDockParent.appendChild(nodes.annotationDock);
    }
  }
  nodes.canvasLightbox.classList.add("hidden");
  nodes.canvasLightbox.classList.remove("is-open");
  nodes.canvasPlaceholder.classList.add("hidden");
  document.body.style.overflow = "";
  canvasEditor?.redraw(bgImage);
}

function setSidebarCollapsed(collapsed) {
  nodes.appShell.classList.toggle("is-sidebar-collapsed", collapsed);
  nodes.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
}

nodes.sidebarToggle.addEventListener("click", () => setSidebarCollapsed(true));
nodes.sidebarRestore.addEventListener("click", () => setSidebarCollapsed(false));
nodes.canvasExpand.addEventListener("click", (event) => {
  event.stopPropagation();
  openCanvasLightbox();
});
nodes.canvasLightboxClose.addEventListener("click", closeCanvasLightbox);
nodes.canvasPlaceholderClose.addEventListener("click", closeCanvasLightbox);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isCanvasLightboxOpen()) {
    closeCanvasLightbox();
  }
});

renderColorToolbar();
initCanvasEditor();
loadProjects();

const siteHomeLink = document.querySelector("#site-home-link");
if (siteHomeLink) siteHomeLink.href = siteHomeUrl();
