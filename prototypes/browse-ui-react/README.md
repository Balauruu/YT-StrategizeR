# PROTOTYPE: browse UI, round 2, Vite + React + FastAPI (#7)

Throwaway. Round 1 (`../browse-ui/`, variants A-D) settled that all four views go into v1. This round shows four *new* variants built on a Node frontend toolchain over a Python backend, to see what that stack makes easy.

Run it (needs Node and [uv](https://docs.astral.sh/uv/)):

```bash
cd prototypes/browse-ui-react && npm install && npm run dev
```

Then open http://localhost:5199. `npm run dev` starts the FastAPI fake-data API on :8765 (via `uv run`, no venv to manage) and Vite on :5199, which proxies `/api`. Switch variants with the bottom bar, `←`/`→`, or `?variant=E|F|G|H`.

| Key | Variant | What the stack buys |
| --- | --- | --- |
| E | Command palette + full virtual table | `cmdk` ⌘K palette for every filter, jump and sort; `@tanstack/react-virtual` renders all ~6k rows with no cap; `j`/`k`/`↵` keyboard navigation |
| F | Linked resizable panels | `react-resizable-panels` workspace; Channels, Topics, score histogram and Videos cross-filter each other; layout remembered |
| G | Zoomable Topic map | Canvas scatter of every Video on a (fake) 2D embedding map with `d3-zoom`; colour by Topic or tier; shift-drag to box-select a region of similar titles |
| H | Topic × Channel heatmap | Median score / outlier count / volume per cell; hatched cells show Topics a Channel never covers |

`server/app.py` generates the data and computes outlier scores the way the real backend would (per `docs/research/outlier-video-definition.md`). The frontend fetches `/api/data` once and filters client-side, which won't hold at 100k Videos: a real build would move filtering and paging to the API.
