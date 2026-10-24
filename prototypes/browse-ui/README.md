# PROTOTYPE: browse and outlier-spotting UI (#7)

Throwaway. Answers: *what should the main screen look like for browsing/searching Videos and spotting outliers across Channels?*

Open `index.html` in a browser (double-click, or `xdg-open prototypes/browse-ui/index.html`). Flip variants with the floating bar at the bottom, `←`/`→`, or `?variant=A|B|C|D`. Click any Video for the detail drawer (baseline neighbours chart + same-Topic outliers on other Channels).

| Key | Variant | Primary affordance |
| --- | --- | --- |
| A | Table + facets | Dense sortable table; sidebar filters for score, format, Channel, Topic |
| B | Topic board | Topics ranked by how many distinct Channels have an outlier in them; best Video per Channel as cards |
| C | Channel swimlanes | One row per Channel, Videos plotted over time by score; outliers pop out visually |
| D | Search-first | Big search box; the query itself is scored (matches, Channels using it, median score, outlier rate) |

Data is fake (20 Channels, ~6k Videos, fixed seed). Scores follow `docs/research/outlier-video-definition.md`: views / median of up to 15 nearest-in-time, same-format, 30+ day-old Videos from the same Channel, 1,000-view floor, hidden under 5 neighbours, dimmed under 10, ⚠ at 20x+ or small baselines.
