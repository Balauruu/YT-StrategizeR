# Open-source importers for YouTube channel video metadata and stats (as of 2026-10-24)

Repo stats below come from the GitHub REST API queried 2026-10-24 (`gh api repos/<owner>/<repo>`, `/releases/latest`). Source column = [GitHub API](https://api.github.com) for each repo listed.

## 1. Which projects exist: approach, fields, maintenance, licence, breakage?

### Takeaway
Two families exist: the official YouTube Data API v3 (via google-api-python-client or any HTTP client), and scrapers of YouTube's internal InnerTube/HTML (yt-dlp, YouTube.js, scrapetube, pytubefix, NewPipeExtractor/Piped, Invidious). Of these, yt-dlp, YouTube.js, Invidious, Piped, and NewPipeExtractor were all pushed within days of 2026-10-24. scrapetube is quiet (last push 2025-09-16), and the youtube-search-python and pytube repos are dead or archived.

### Cited Findings
Repo facts (stars / last push / latest release / licence):
- yt-dlp: 200,955 stars; pushed 2026-10-23; release 2026.10.21; Unlicense — [GitHub](https://github.com/yt-dlp/yt-dlp)
- YouTube.js (youtubei.js, InnerTube JS client): 5,387 stars; pushed 2026-10-23; v18.3.0 on 2026-10-23; MIT. README: works on Node.js, Deno, browsers; unofficial, "not affiliated with, endorsed, or sponsored by YouTube" — [GitHub](https://github.com/LuanRT/YouTube.js)
- Invidious: 25,623 stars; pushed 2026-10-23; v2.20261022.0 on 2026-10-22; AGPL-3.0 — [GitHub](https://github.com/iv-org/invidious)
- Piped: 10,289 stars; pushed 2026-10-23; no GitHub release published; AGPL-3.0. README: "does not use official YouTube APIs", uses NewPipeExtractor — [GitHub](https://github.com/TeamPiped/Piped)
- NewPipeExtractor (Java): 2,022 stars; pushed 2026-10-23; v0.26.5 on 2026-08-15; GPL-3.0 — [GitHub](https://github.com/TeamNewPipe/NewPipeExtractor)
- FreeTube (desktop client): 22,123 stars; pushed 2026-10-23; AGPL-3.0 — [GitHub](https://github.com/FreeTubeApp/FreeTube)
- scrapetube (Python): 524 stars; last push and v2.6.0 release both 2025-09-16; MIT. Scrapes directly "without the official youtube api and without selenium". README shows only `videoId` in examples (get_channel, get_playlist, get_search); no limitations documented; 27 open issues — [GitHub](https://github.com/dermasmid/scrapetube)
- pytubefix: 1,647 stars; pushed 2026-10-16; v11.2.1; MIT — [GitHub](https://github.com/JuanBindez/pytubefix)
- pytube (original): 13,194 stars; last push 2024-08-15; last release v11.0.1 on 2021-08-27 — [GitHub](https://github.com/pytube/pytube)
- youtube-search-python: archived; last push 2022-06-30 — [GitHub](https://github.com/alexmercerind/youtube-search-python)
- youtube-dl: last push 2026-02-19; last release 2021.12.17 — [GitHub](https://github.com/ytdl-org/youtube-dl)
- coletdjnz/yt-dlp-youtube-oauth2: archived, last push 2024-10-29. The yt-dlp wiki says OAuth login no longer works; cookies are recommended — [GitHub](https://github.com/coletdjnz/yt-dlp-youtube-oauth2), [yt-dlp wiki](https://github.com/yt-dlp/yt-dlp/wiki/Extractors)
- google-api-python-client (official API wrapper): 8,951 stars; pushed 2026-10-20; v2.201.0 on 2026-09-30; Apache-2.0 — [GitHub](https://github.com/googleapis/google-api-python-client)
- YoutubeExplode (.NET, scraping): 3,744 stars; pushed 2026-10-20; 6.6.2 on 2026-08-25; MIT — [GitHub](https://github.com/Tyrrrz/YoutubeExplode)
- youtube-transcript-api: 8,500 stars; pushed 2026-10-20; v1.2.4 on 2026-01-29; MIT. Transcripts only, not stats — [GitHub](https://github.com/jdepoix/youtube-transcript-api)
- Benjamin-Loison/YouTube-operational-API: self-hosted PHP API, README says it "works when YouTube Data API v3 fails"; 501 stars; pushed 2026-09-24; no licence shown in the GitHub API response or README; 184 open issues; no public instances listed — [GitHub](https://github.com/Benjamin-Loison/YouTube-operational-API)

Approach and field notes:
- Official API quota: default 10,000 units/day. videos.list, playlistItems.list and channels.list cost 1 unit per call. search.list has its own cap of 100 calls/day — [Google docs](https://developers.google.com/youtube/v3/determine_quota_cost)
- Invidious `GET /api/v1/channels/:id/videos` takes a `continuation` token (not page numbers) and `sort_by` of newest/popular/oldest (`oldest` was marked "Broken as of 10/2022"). Returns `videos` (VideoObject array) plus `continuation` — [Invidious docs](https://docs.invidious.io/api/channels_endpoint/)
- Invidious fields: `viewCount`, `published`, `publishedText`, `lengthSeconds` appear in list endpoints; `likeCount` appears only in `/videos/:id` and comments, not in list endpoints — [Invidious API docs](https://docs.invidious.io/api/)
- YouTube.js has PoToken and session options (`po_token`, `generate_session_locally`, `fast_fail`, `enable_session_cache`). Docs I could fetch do not cover channel-video getters or view-count fields — [ytjs.dev](https://ytjs.dev/guide/getting-started.html)

Breakage and rate limits:
- yt-dlp wiki: YouTube is gradually requiring PO Tokens, which yt-dlp cannot generate. Default clients work without them. Guest sessions are limited to about 300 videos/hour and account sessions to about 2,000 at default settings. The error "This content isn't available, try again later" signals the rate limit. Account use risks a ban — [yt-dlp wiki](https://github.com/yt-dlp/yt-dlp/wiki/Extractors)
- yt-dlp FAQ: HTTP 429/402 mean IP blocking; mitigations are CAPTCHA plus cookies, `--proxy`, or `--source-address` — [yt-dlp FAQ](https://github.com/yt-dlp/yt-dlp/wiki/FAQ)
- TubeSync warns an IP "could get throttled and/or banned" if large amounts are crawled quickly, and suggests the longest index interval (up to 24h) — [TubeSync](https://github.com/meeb/tubesync)
- Pinchflat suggests `YT_DLP_WORKER_CONCURRENCY=1` if IP-limited — [Pinchflat](https://github.com/kieraneglin/pinchflat)

### Inferences
- For a channel-listing-with-stats tool, the best-maintained scraping foundation is yt-dlp. It is embeddable as a Python library, updates several times a month, and every self-hosted archiver below wraps it. The dated entries (pytube, youtube-search-python, youtube-dl, the OAuth plugin) should be avoided.
- scrapetube is simple but has had no push in about 13 months, and its README documents only video IDs. Treat it as a reference, not a foundation.
- Public Invidious/Piped instances are poor for 100k-video bulk work. I found no rate-limit documentation for public instances, and list endpoints lack like counts. Self-hosting is possible but adds ops burden.

### Gaps
- The exact per-video fields returned by yt-dlp's flat-playlist mode versus a full per-video extract (view_count, upload_date, like_count availability) were not confirmed from a fetched source; the README fetch was truncated. From general knowledge, flat extraction usually returns id, title, duration and often view_count but not upload date or likes — verify before relying on it.
- YouTube.js channel `getVideos`/continuation behavior and field list not confirmed.
- Open issue counts for scrapetube/YouTube.js/yt-dlp breakage were not reviewed individually.
- Piped and Invidious public-instance rate limits not found.
- Licence for YouTube-operational-API not found.

## 2. Viable foundations or references for a local app with a local DB and stat snapshots

### Takeaway
No surveyed archiver is built for time-series stat snapshots; they track current metadata plus downloads. The practical design is a thin custom collector on yt-dlp (or the official API), writing to SQLite, with the archivers as schema/scheduling references.

### Cited Findings
- Tube Archivist: Elasticsearch + Redis + Docker + yt-dlp. Needs about 2GB RAM minimum (4GB for mid-to-large) and `vm.max_map_count` >= 262144. Features include comments, subtitles, SponsorBlock, viewed/unviewed tracking. Version v0.5.12 released 2026-08-25, 8,538 stars, pushed 2026-10-23, GPL-3.0. Its README does not state which stats are stored — [GitHub](https://github.com/tubearchivist/tubearchivist)
- TubeSync: Django + SQLite (default) or PostgreSQL via `DATABASE_CONNECTION`, wraps yt-dlp and ffmpeg with a background task scheduler. v0.18.5 released 2026-10-08, 2,808 stars, pushed 2026-10-23, AGPL-3.0. Settings `TUBESYNC_SHRINK_NEW`/`TUBESYNC_SHRINK_OLD` trim stored metadata — [GitHub](https://github.com/meeb/tubesync)
- Pinchflat: Elixir + SQLite (WAL by default, `JOURNAL_MODE` configurable) + yt-dlp. 5,416 stars, but last push 2025-12-16 and last release v2025.9.26, so it looks stalled as of this date. AGPL-3.0. README says "anything can break at any time"; 202 open issues — [GitHub](https://github.com/kieraneglin/pinchflat)
- Official API cost for 100k videos (arithmetic from documented 50-items-per-page API limits, which I did not re-fetch): about 2,000 playlistItems.list calls plus 2,000 videos.list calls, roughly 4,000 units, inside one 10,000-unit daily quota. The 1-unit costs are cited above — [Google docs](https://developers.google.com/youtube/v3/determine_quota_cost)

### Inferences
- A repeat snapshot job on 100k videos is cheap through the official API (about 4,000 units per full pass) but expensive and ban-prone via scraping (at the yt-dlp guest limit of about 300 videos/hour, a full per-video pass takes weeks). Flat/channel-tab listing is far cheaper than per-video extraction.
- Pinchflat and TubeSync are the closest structural references for a single-user SQLite app; Tube Archivist's Elasticsearch stack is heavyweight for a local single-user tool. All three are licensed GPL/AGPL, so copying code would impose copyleft; using yt-dlp (Unlicense) or YouTube.js/scrapetube (MIT) imposes none.
- The 50-per-page figure and the "weeks" estimate are my calculations, not cited.

### Gaps
- No "YouTube analytics dashboard" GitHub repo was reviewed in this pass; I did not find or evaluate specific ones, so I cannot say whether any stores time-series snapshots.
- Schemas of the three archivers were not inspected.

## 3. Terms-of-service and legal considerations

### Takeaway
Scraping contradicts YouTube's ToS and API policy on paper, and API data comes with a 30-day storage rule and a ban on derived metrics for unauthorised data. The archivers and scrapers mostly say nothing about this.

### Cited Findings
- YouTube ToS prohibits access by "robots, botnets or scrapers" (paraphrased from the Romanian-language page I fetched), except public search engines following robots.txt, with YouTube's written permission, or as allowed by law. It also bars downloading or reusing content without permission, and permits personal, non-commercial viewing — [YouTube Terms](https://www.youtube.com/t/terms)
- API Developer Policies: do not scrape YouTube, directly or indirectly, or obtain scraped data — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- Same policy: statistics retrieved without user authorization (e.g. subscriber count) cannot be stored over 30 days without channel-owner authorization; view-count-type statistics can exceed 30 days with a re-verification every 30 days; keep data fresh. Do not replace API data with independently calculated data or create new derived metrics, and do not aggregate across different content owners. From 2026-06-01, audited developers may apply for permission to create additional metrics or store statistical data — [Developer Policies](https://developers.google.com/youtube/terms/developer-policies)
- Tube Archivist, TubeSync, Pinchflat READMEs do not discuss YouTube ToS (TubeSync only warns about IP throttling/banning) — respective GitHub pages above.
- YouTube.js disclaims affiliation with YouTube and says trademark use is nominative — [GitHub](https://github.com/LuanRT/YouTube.js)

### Inferences
- A personal, local, non-redistributed tool that stores snapshots of public stats over time likely conflicts with the API policy's 30-day and derived-metric rules if built on the Data API, and with ToS automated-access terms if built on scraping. Enforcement against a single user is practical risk (IP throttling, account bans if cookies are used) rather than a documented legal action; I found no source on enforcement against individuals.
- This is not legal advice.

### Gaps
- The Developer Policies fetch was a model summary; the clause numbers (III.E.4.b, III.E.6) should be checked against the primary page before quoting.
- Jurisdiction-specific law on scraping public data was not researched.
