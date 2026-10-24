# Python, local web app, SQLite, YouTube Data API v3

Status: accepted (resolves #5)

- **Language/runtime:** Python. Embeddings, UMAP/HDBSCAN (BERTopic) and any yt-dlp use are Python-native, so one language covers import, topic derivation and the server.
- **UI:** local web app served on localhost and opened in a browser, suited to sortable/filterable views over ~100k Videos.
- **Database:** SQLite, a single file. Embeddings are stored alongside (blob column or sidecar numpy file) so re-clustering and incremental Sync stay cheap.
- **Data source:** YouTube Data API v3 for Import and Sync (uploads-playlist path: ~4,000 quota units for 100k Videos, exact dates and stats). yt-dlp is not part of the stack.

## Consequences

- The API developer policy limits storing non-authorized stats to 30 days, which conflicts in letter with keeping long-lived stat snapshots. Accepted as a gray area for a personal single-user tool; revisit if the tool is ever shared.
- Needs a Google Cloud project and API key; daily quota of 10,000 units bounds full re-Syncs.
