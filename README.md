# Smart To-Do List

A responsive, single-page To-Do List web app built with vanilla HTML, CSS, and JavaScript. Tasks persist across page refreshes using the browser's Local Storage — no backend or build step required.

## Features

- **Add tasks** — type a task and press "Add Task" or hit Enter.
- **Mark complete** — click the checkbox to toggle a task's completed state (strikethrough + gray color).
- **Delete tasks** — remove any task instantly with the 🗑 button.
- **Persistent storage** — all tasks are saved to Local Storage automatically and reloaded on page start.
- **Live counter** — "Tasks Left" always reflects the number of incomplete tasks.
- **Filters** — view All / Active / Completed tasks.
- **Clear completed** — remove all completed tasks in one click.
- **Dark mode** — toggle and remember your preferred theme.
- **Validation** — empty tasks, duplicate tasks, and tasks over 100 characters are rejected with inline feedback.
- **Fully responsive** — works on desktop, tablet, and mobile.

## Getting Started

No installation or build tools needed.

1. Download or clone this folder.
2. Open `index.html` directly in your browser.

That's it — the app runs entirely client-side.

## Project Structure

```
todo-list/
│
├── index.html          # App markup
├── style.css           # Styling, theme variables, responsive rules
├── script.js           # App logic (state, rendering, Local Storage)
├── README.md
└── assets/
    └── icons/
```

## Data Model

Each task is stored as a plain object:

```js
{
  id: 1,
  text: "Learn DOM",
  completed: false
}
```

The full array of tasks is serialized with `JSON.stringify` and saved under the `smart-todo-tasks` key in Local Storage. On load, it's parsed back with `JSON.parse`.

## How Persistence Works

- Every time a task is added, completed/uncompleted, or deleted, `saveTasks()` writes the current `tasks` array to Local Storage.
- On page load, `loadTasks()` reads and parses any existing data before the first render.
- If Local Storage is empty or unavailable, the app simply starts with an empty list.

## Browser Support

Works in all modern browsers that support Local Storage and ES6 (Chrome, Firefox, Safari, Edge).

## License

Free to use and modify for personal or educational projects.
