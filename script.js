/* ===========================================================
   Smart To-Do List — Logic
   Vanilla JS, Local Storage persistence, no dependencies.
   =========================================================== */

(function () {
  "use strict";

  // ---------- Constants ----------
  const STORAGE_KEY = "smart-todo-tasks";
  const THEME_KEY = "smart-todo-theme";
  const MAX_LENGTH = 100;

  // ---------- DOM references ----------
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const inputError = document.getElementById("input-error");
  const list = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");
  const tasksLeftEl = document.getElementById("tasks-left");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const themeToggle = document.getElementById("theme-toggle");

  // ---------- State ----------
  let tasks = [];
  let currentFilter = "all"; // all | active | completed

  // ---------- Storage helpers ----------
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to load tasks from Local Storage:", err);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Failed to save tasks to Local Storage:", err);
    }
  }

  // ---------- ID generation ----------
  function nextId() {
    return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  // ---------- Validation ----------
  function validateInput(rawValue) {
    const value = rawValue.trim();

    if (value.length === 0) {
      return { valid: false, message: "Task can't be empty." };
    }
    if (value.length > MAX_LENGTH) {
      return { valid: false, message: `Task can't exceed ${MAX_LENGTH} characters.` };
    }
    // Prevent duplicate empty-ish entries (case-insensitive exact match on active list)
    const isDuplicate = tasks.some(
      (t) => t.text.toLowerCase() === value.toLowerCase()
    );
    if (isDuplicate) {
      return { valid: false, message: "That task is already on your list." };
    }
    return { valid: true, value };
  }

  function showError(message) {
    inputError.textContent = message;
    input.classList.add("input-invalid");
    if (message) {
      clearTimeout(showError._t);
      showError._t = setTimeout(() => {
        inputError.textContent = "";
      }, 2500);
    }
  }

  // ---------- Rendering ----------
  function getFilteredTasks() {
    switch (currentFilter) {
      case "active":
        return tasks.filter((t) => !t.completed);
      case "completed":
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }

  function render() {
    const filtered = getFilteredTasks();

    list.innerHTML = "";

    if (filtered.length === 0) {
      emptyState.hidden = false;
      emptyState.textContent =
        tasks.length === 0
          ? "Nothing here yet — add your first task above."
          : `No ${currentFilter} tasks.`;
    } else {
      emptyState.hidden = true;
      const fragment = document.createDocumentFragment();
      filtered.forEach((task) => fragment.appendChild(buildTaskElement(task)));
      list.appendChild(fragment);
    }

    updateTasksLeft();
    saveTasks();
  }

  function buildTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.dataset.id = String(task.id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.completed ? "incomplete" : "complete"}`);
    checkbox.addEventListener("change", () => toggleComplete(task.id));

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "task-delete";
    deleteBtn.innerHTML = "🗑";
    deleteBtn.setAttribute("aria-label", `Delete "${task.text}"`);
    deleteBtn.addEventListener("click", () => deleteTask(task.id, li));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
  }

  function updateTasksLeft() {
    const left = tasks.filter((t) => !t.completed).length;
    tasksLeftEl.textContent = `Tasks Left: ${left}`;
  }

  // ---------- Actions ----------
  function addTask(text) {
    tasks.push({ id: nextId(), text, completed: false });
    render();
  }

  function toggleComplete(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      render();
    }
  }

  function deleteTask(id, element) {
    if (!element) {
      tasks = tasks.filter((t) => t.id !== id);
      render();
      return;
    }
    // Animate out, then remove from state
    element.classList.add("removing");
    element.addEventListener(
      "animationend",
      () => {
        tasks = tasks.filter((t) => t.id !== id);
        render();
      },
      { once: true }
    );
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    render();
  }

  // ---------- Filters ----------
  function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach((btn) => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    render();
  }

  // ---------- Theme ----------
  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggle.textContent = "☀️ Light mode";
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(THEME_KEY, "light");
      themeToggle.textContent = "🌙 Dark mode";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem(THEME_KEY, "dark");
      themeToggle.textContent = "☀️ Light mode";
    }
  }

  // ---------- Event listeners ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = validateInput(input.value);
    if (!result.valid) {
      showError(result.message);
      return;
    }
    showError("");
    addTask(result.value);
    input.value = "";
    input.focus();
  });

  input.addEventListener("input", () => {
    input.classList.remove("input-invalid");
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  themeToggle.addEventListener("click", toggleTheme);

  // ---------- Init ----------
  function init() {
    tasks = loadTasks();
    loadTheme();
    render();
  }

  init();
})();
