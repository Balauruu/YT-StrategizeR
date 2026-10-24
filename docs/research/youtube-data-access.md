# Research: ways to get a channel's videos and stats

Issue: Balauruu/YT-StrategizeR#2 (child of map #1). Researched 2026-10-24. Facts and costs only, no recommendation.

Question: how can a local tool list ALL videos of a channel (by URL/handle) with title, publish date, views, duration, ideally likes/tags? Compare YouTube Data API v3 with yt-dlp / scraping.

Sources are primary: Google's YouTube Data API reference and policy pages, and the yt-dlp README, wiki and source. Items marked **[unverified]** were not confirmed in the fetched primary text.

## 1. YouTube Data API v3 (official)

### Setup
- Needs a Google account, a Google Cloud project, and the YouTube Data API v3 enabled on it. For public data an API key is enough; list methods work without user authorization. OAuth is required only for insert/update/delete. ([Getting started](https://developers.google.com/youtube/v3/getting-started))
- Default quota: 10,000 units/day for all endpoints combined; `search.list` and `videos.insert` additionally capped at 100 calls/day. Defaults are "subject to change". More quota requires the quota extension request form. ([Getting started](https://developers.google.com/youtube/v3/getting-started), [Quota cost](https://developers.google.com/youtube/v3/determine_quota_cost))

### Quota cost (read methods)
Per the [quota cost table](https://developers.google.com/youtube/v3/determine_quota_cost): `channels.list` = 1, `playlistItems.list` = 1, `videos.list` = 1, `search.list` = 1 call but in its own bucket of 100 calls/day. Cost is per call, independent of `part` or number of items returned.

### Handle resolution
`channels.list` with `forHandle` (leading `@` optional) returns the channel. Cost 1. Other filters: `id`, `forUsername`, `mine`. ([channels.list](https://developers.google.com/youtube/v3/docs/channels/list)) `/channel/UC...` URLs give the ID directly. Legacy `/c/Name` URLs are not described by the reference. **[unverified]**

### Listing ALL videos: the uploads playlist path
1. `channels.list?part=contentDetails,statistics,snippet&forHandle=...` returns `contentDetails.relatedPlaylists.uploads` (the uploads playlist ID), plus `statistics.videoCount` (public videos only), `viewCount`, `subscriberCount` (rounded to 3 significant figures; `hiddenSubscriberCount`), `snippet.customUrl`, title. ([channels resource](https://developers.google.com/youtube/v3/docs/channels))
2. `playlistItems.list?playlistId=<uploads>&part=snippet,contentDetails&maxResults=50`, paging with `nextPageToken` until absent. Max 50 per page. Returns title, description, `position`, `resourceId.videoId`. ([playlistItems.list](https://developers.google.com/youtube/v3/docs/playlistItems/list))
3. `videos.list?id=<comma list>&part=snippet,contentDetails,statistics`, 1 unit per call; `maxResults` is not supported with `id`. ([videos.list](https://developers.google.com/youtube/v3/docs/videos/list)) The per-call ID cap is believed to be 50, but the fetched reference page and discovery document do not state it. **[unverified]**

Google's `search.list` page says `order=date` "can suffer from indexing delays and incomplete results", recommends `playlistItems.list` on the uploads playlist instead, and states a `channelId` + `type=video` search is "constrained to a maximum of 500 videos". So `search.list` cannot enumerate a large channel. ([search.list](https://developers.google.com/youtube/v3/docs/search/list))

### Cost to import ~100k videos (assuming 50 per call)
- Enumerate: 100,000 / 50 = 2,000 `playlistItems.list` calls = 2,000 units.
- Hydrate stats: 2,000 `videos.list` calls = 2,000 units.
- Plus 1 `channels.list` call per channel.
- Total about 4,000 units, about 40% of one default daily quota; fits in one day.
- Full stats refresh of all 100k videos: another 2,000 units (IDs already known).
- Incremental sync of new uploads: read page 1 of the uploads playlist (1 unit), stop at first known ID, `videos.list` the new ones.
- `playlistItems` gives title but not views/duration, so step 3 is required for those.

### Fields available (via `videos.list`)
Per the [videos resource](https://developers.google.com/youtube/v3/docs/videos):
- `snippet`: `title`, `description`, `publishedAt` (ISO 8601; can differ from upload time, e.g. private then made public), `tags` (owner-provided list), `categoryId`, `channelId`, `liveBroadcastContent` (`live`/`none`/`upcoming`), thumbnails.
- `contentDetails.duration`: ISO 8601 (`PT15M33S`, `PT#H#M#S`, `P#DT#H#M#S`), may differ ~1s from playback.
- `statistics`: `viewCount`, `likeCount`, `commentCount`, `favoriteCount`. `dislikeCount` is private since 2021-12-13 (owner-authenticated only). The page states no hidden-like-count note for `likeCount`. **[unverified whether owners can hide it]**
- From 2026-08-24 the docs say views for all formats are counted at playback start rather than after a full view. This changes metric definition and affects comparability of old vs new view counts.
- Shorts and live/upcoming items appear in the uploads playlist; no explicit "is Short" field was found in the reference (use `duration` / `liveBroadcastContent`). **[unverified]**

### Terms / policy constraints for a local DB
[YouTube API Services Developer Policies](https://developers.google.com/youtube/terms/developer-policies):
- Non-authorized (API-key) data may be stored only temporarily, "no more than 30 calendar days", then deleted or refreshed. "Must not store statistics retrieved as Non-Authorized Data for more than 30 days."
- Stored data must be kept consistent with current YouTube data.
- API clients must not scrape YouTube or Google applications.
- No downloading/caching of video content without written approval.
In letter this conflicts with a long-lived local history of view-count snapshots (map #1's "stat snapshots over time"). The policy does not say how it is applied to a personal local tool.

### Reliability
Documented, versioned API; quota is the main limit. Private/deleted videos drop out. `videoCount` counts public videos only, so it can serve as a completeness check against the enumerated count.

## 2. yt-dlp (scraping via YouTube's internal Innertube/web endpoints)

### Setup
No key or account for public metadata. A JavaScript runtime (deno recommended; node, bun, QuickJS supported; only deno enabled by default) plus yt-dlp-ejs is documented as required for full YouTube support. ([README](https://github.com/yt-dlp/yt-dlp/blob/master/README.md))

### Handle / URL resolution
Accepts `/@handle`, `/channel/`, `/c/`, `/user/`, and tab suffixes (`/videos`, `/shorts`, `/streams`, `/playlists`); falls back to `navigation/resolve_url` if the webpage is unavailable. ([`_tab.py`, YoutubeTabIE](https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/youtube/_tab.py))

### Two modes
1. **Flat** (`--flat-playlist` with `-J`/`-j`): pages the channel tab through the Innertube `browse` continuation endpoint without visiting each video. Entries contain `id`, `url`, `title`, `duration`, `view_count`, `channel`, `channel_id`, `uploader`, `uploader_id`, `thumbnails`, `live_status`, `availability`. `upload_date` is NOT set; `timestamp` is set only with `--extractor-args youtubetab:approximate_date`, derived from relative text like "2 years ago" (README: date filters may be slightly off). View counts are parsed from display text (`viewCountText` etc.). No likes, no tags. ([`_tab.py`](https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/youtube/_tab.py), [README](https://github.com/yt-dlp/yt-dlp/blob/master/README.md))
2. **Full** (`--no-flat-playlist`, or flat listing then per-video extraction with simulate/`--skip-download`): one or more requests per video. README output-template fields include `view_count`, `like_count`, `comment_count`, `duration` (seconds), `upload_date` (YYYYMMDD, UTC), `timestamp`, `release_timestamp`, `tags`, `categories`, `channel_follower_count`.
- `--print`/`-O` emits chosen fields; `--dump-json` emits full JSON per video.

### Cost / rate limits
- No quota units, but a request-rate limit exists. yt-dlp wiki (Extractors, YouTube): the error "This content isn't available, try again later" is caused by exceeding the video request rate limit; recommends a 5-10 second delay between downloads; guest-session limit "~300 videos/hour", accounts roughly 2,000 videos/hour. ([Extractors wiki](https://github.com/yt-dlp/yt-dlp/wiki/Extractors)) Whether this applies to metadata-only extraction is not stated. **[unverified]**
- Illustrative arithmetic only, from the wiki's figures: 100k full extractions at ~300/hour is about 333 hours (~14 days); at ~2,000/hour about 50 hours. Flat mode avoids per-video requests (about 2,000 continuation pages if ~50 items/page, which is **[unverified]**).
- Throttle flags: `--sleep-requests`, `--sleep-interval`, `--limit-rate`; `--impersonate` for TLS fingerprinting cases.

### Reliability, risk, ToS
- Depends on undocumented internal endpoints and page layout; the source maintains several renderer paths (`gridVideoRenderer`, `playlistVideoRenderer`, `lockupViewModel`) against layout changes. Periodic breakage fixed by upgrading yt-dlp is expected.
- PO Token: wiki says YouTube is "gradually enforcing" PO Tokens for downloads and yt-dlp cannot generate them. This concerns media downloads; relevance to metadata-only listing not confirmed. ([Extractors wiki](https://github.com/yt-dlp/yt-dlp/wiki/Extractors), [PO Token Guide](https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide))
- Cookies/account (optional for public data): wiki warns "By using your account with yt-dlp, you run the risk of it being banned (temporarily or permanently)" and suggests a throwaway account.
- ToS: the API developer policy prohibits scraping for API clients. The general YouTube Terms of Service page was not fetched. **[unverified]**
- Flat-mode view counts come from display text (may be rounded); likes need full mode.

## 3. Side by side

| | Data API v3 | yt-dlp flat | yt-dlp full |
|---|---|---|---|
| Auth | API key (Cloud project) | none | none (cookies optional, ban risk) |
| 100k videos cost | ~4,000 quota units (~40% of one day) | ~2,000 page requests | ~100k requests, rate-limited |
| Title | yes | yes | yes |
| Publish date | exact `publishedAt` | approximate, opt-in | `upload_date` / `timestamp` |
| Views | exact `viewCount` | parsed from display text | `view_count` |
| Duration | ISO 8601 | seconds | seconds |
| Likes | `likeCount` | no | `like_count` |
| Tags | `snippet.tags` | no | `tags` |
| Comment count | yes | no | `comment_count` |
| Stability | versioned API | breaks with layout changes | same |
| Policy | 30-day cap on non-authorized stored data; no scraping | undocumented endpoints | same; account ban risk if cookies |

## 4. Open items not resolved from primary text
- `videos.list` ids-per-call cap (believed 50).
- Resolution of legacy `/c/` URLs with the API.
- Whether hidden like counts are omitted from `likeCount`.
- Whether yt-dlp rate limits / PO Token enforcement apply to metadata-only extraction at 100k scale.
- Current YouTube ToS wording on automated access.
