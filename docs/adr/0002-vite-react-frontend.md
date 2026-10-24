# Vite + React frontend over the Python backend

Status: accepted (extends ADR-0001; resolves the stack implication of #7)

The UI is a Vite + React single-page app. A Python (FastAPI) JSON API serves it locally. Node is a build-time dependency only: the built static files are served by the Python process, so running the app still needs only Python. ADR-0001 chose a local web app but no frontend toolchain. The main screen settled in #7 (Videos, Topics and Channels views; one global filter bar; ⌘K palette; shared detail pane) depends on interactive pieces that are expensive to hand-roll and come ready-made in React's ecosystem:

- a virtualized table over every Video (TanStack Virtual)
- a command palette (cmdk)
- resizable split panes (react-resizable-panels)
- a zoomable canvas map of thousands of points (d3-zoom)
- client state shared across views

The #7 prototypes were built on exactly this stack.

## Considered options

- **Python-rendered pages (Jinja + htmx or similar).** One language, but cross-view state, the palette and the canvas map would be hand-written JavaScript anyway.
- **Plain JavaScript, no build step.** It worked for the first round of #7 prototypes. It doesn't scale to three linked views without rebuilding React's state handling by hand.
- **Svelte or Vue + Vite.** Viable, but React has the largest ecosystem for the libraries above.

## Consequences

- Two toolchains: Python (uv) for the backend and topic work, Node for frontend development and builds. Development runs both, with Vite proxying `/api` to FastAPI.
- The API owns filtering, sorting, paging and outlier scoring. At up to ~100k Videos the browser can't load everything and filter it locally, as the prototypes did. The frontend holds only view state and the current page or aggregate.
