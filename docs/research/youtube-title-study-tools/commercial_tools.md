# Commercial tools for studying YouTube titles, topics and outlier videos (as of Oct 2026)

Source-quality caveat: most comparison articles are written by vendors (OutlierKit, 1of10, Overseer) who compete with each other. Prices conflict across sources and change often. Official pages are preferred where I could fetch them. No official ViewStats or Playboard methodology/help page was retrievable.

## 1. Per-tool: title/topic study, outlier finding, how channels are added, outlier definition

### Takeaway
Every tool defines an outlier as a video's views relative to its own channel's baseline (a ratio, "Nx"). Only Subscribr discloses a precise formula (average of up to 10 surrounding videos). vidIQ says "average views in a similar timeframe". Others leave the mean/median and window undisclosed. None of the tools found offers explicit title-pattern analysis or topic clustering as a first-class local feature. Title work is mostly "AI title generators" or "find similar videos".

### Cited Findings
- 1of10 (vendor review, 31 Jul 2026): outlier score = "a video's views divided by its channel's typical views"; the article does not say mean vs median or the window. Features: Outlier Finder (topic/niche search ranked by score, filters: score, views, date, duration, language), Niche Explorer, Thumbnail Search, trending format detection, Title Generator (Pro) that drafts titles from patterns in its outlier database. — [1of10 review](https://1of10.com/blog/1of10-review/)
- 1of10 official pricing page lists research tools on all plans: Outlier search, Thumbnail search, Trending formats, Competitor tracking. Free plan shows only 5 results for outlier search and thumbnail search and the top 3 trending formats. — [1of10 pricing](https://1of10.com/pricing)
- vidIQ (official help): outlier score "measures a video's performance relative to the average performance of other videos on the same channel", comparing views to the channel's average for a similar timeframe. Example: 10,000 views on a channel averaging 1,000 = 10x. Colors: black under 2x, blue 2-5x, purple 5-10x, red above 10x. — [vidIQ support](https://support.vidiq.com/en/articles/9660010-outliers)
- vidIQ filters (paid only): outlier score 0-100+, views 0-10M+, subscribers 0-10M+, views per hour 0-1K+, length 0-60+ min, publish date (week to all time). Tabs for Videos, Shorts, Channels, Thumbnails. A browser extension shows the score on YouTube/Studio. — [vidIQ support](https://support.vidiq.com/en/articles/9660010-outliers)
- vidIQ adding channels: "Add as competitor" quick action on an outlier result adds its channel to the Competitors tool; "Find similar videos" re-searches using the video's title; "Give me ideas" starts a blueprint from the title. The help article describes no other way to add channels. — [vidIQ support](https://support.vidiq.com/en/articles/9660010-outliers)
- Subscribr (official help) is the only disclosed formula: score = video views / average views of up to 10 surrounding videos (before and after) from the same channel, rounded to 1 decimal. — [Subscribr help](https://help.subscribr.ai/article/48-what-are-velocity-and-outlier-scores)
- ViewStats (MrBeast co-founded, Dec 2023): scores each video against the channel's average in a similar timeframe; outlier detection is Pro-only per OutlierKit (competitor). OutlierKit attributes the same black/blue/purple/red tiers to ViewStats that vidIQ's own help page documents for vidIQ; this is a likely mix-up, treat ViewStats tiers as unverified. — [OutlierKit comparison, page dated Oct 2026](https://outlierkit.com/blog/best-youtube-outlier-finder-tools); [Tubefilter](https://www.tubefilter.com/?p=180350)
- ViewStats extras (per OutlierKit): thumbnail search, A/B thumbnail test database, Collections, alerts. No script analysis or keyword research. — [OutlierKit](https://outlierkit.com/blog/best-youtube-outlier-finder-tools)
- OutlierKit: outlier tiers 3-5x solid, 5-10x strong, 10x+ exceptional; proprietary inputs include first 24-48h velocity, engagement, subscriber conversion; includes a title tool ranking 16 generated titles against breakout videos, niche gap analysis. How channels are added is not described. — [OutlierKit](https://outlierkit.com/blog/best-youtube-outlier-finder-tools)
- Third-party analysis: tools differ mainly in baseline (mean vs median) and almost none disclose it; a median over the last 50 uploads is one common alternative, and median is argued to resist a single viral video skewing the mean. — [Overseer](https://www.overseeros.com/blog/youtube-outlier-benchmark-report), [ytgrowth](https://ytgrowth.io/blog/youtube-outlier-video) (secondary, unverified)
- Playboard: ranking/analytics site. Popularity score uses recent views plus likes weighted tenfold; ranks only channels with at least 1,000 subs and 1M cumulative views; auto category/tags. Not an outlier finder per se. — [Playboard about](https://playboard.co/en/about)
- Social Blade: channel stats/history and rankings (tiers Bronze-Platinum), not an outlier or title tool. — [OutlierKit Social Blade pricing, Aug 2026](https://outlierkit.com/resources/social-blade-pricing/)
- TubeBuddy: OutlierKit's roundup excludes TubeBuddy (and Subscribr) as lacking outlier detection. One source places "competitor scorecards" in the top Legend tier (unverified). — [OutlierKit](https://outlierkit.com/blog/best-youtube-outlier-finder-tools); [TubeBuddy pricing search result via 1of10](https://1of10.com/blog/tubebuddy-pricing-review/)

### Inferences
- "Outlier" = ratio to channel baseline is the de facto standard; baseline window and mean-vs-median is the real design choice, and a local tool can make it transparent and configurable (e.g. median of the last N uploads, excluding the video itself).
- Topic grouping and title-pattern analysis (n-gram/format clustering across tracked channels) appear unaddressed by commercial tools beyond AI generation and "similar search".

### Gaps
- Official ViewStats definition and methodology, vidIQ's exact baseline (mean/median, window), and 1of10's baseline were not found.
- Whether any tool clusters topics or extracts title templates deterministically could not be confirmed; features are described only in vendor marketing.

## 2. Pricing, data limits, hosted vs local, export/API

### Takeaway
All are hosted SaaS; none is local-first. Outlier features cost roughly $15-$70/month for individuals. Export/API is mostly absent or restricted to top tiers.

### Cited Findings
- 1of10 official: Free $0 (60 credits, 1 channel), Basic $15/mo yearly or $19 monthly (150 credits, up to 3 channels), Pro $69 yearly or $89 monthly (1,000 credits, unlimited channels, MCP and API access), Ultra about $4,999/yr (3,500 credits). Research tools use no credits; AI tools do (title/idea run 8 credits). — [1of10 pricing](https://1of10.com/pricing)
- Conflict: a 1of10 vendor review (Jul 2026) lists Free (3 tracked channels), Basic $29/mo, Pro $69/mo and says no self-serve public API. — [1of10 review](https://1of10.com/blog/1of10-review/); contradicted by the official pricing page above (check live site).
- vidIQ: free plan has no outlier advanced filters; paid Boost about $39/mo monthly or $199/yr, Max about $39/mo annual per OutlierKit; AI credits 150 Free / 2,000 Boost / 6,000 Max. Prices personalized and promo-dependent. No documented search/competitor quotas in the outlier article. — [OutlierKit vidIQ pricing](https://outlierkit.com/resources/vidiq-pricing/), [1of10 vidIQ alternatives](https://1of10.com/blog/vidiq-alternatives/), [vidIQ support](https://support.vidiq.com/en/articles/9660010-outliers)
- ViewStats: Pro reported at $49.99/mo (price hidden on its official pricing page); Business from $249/mo with unlimited credits. Export not mentioned. — [ViewStats pricing](https://www.viewstats.com/pricing), [Tubefilter](https://www.tubefilter.com/?p=180350)
- OutlierKit: from $49/mo with a 30-credit trial (conflicting other figures of $9 and $19/mo in its own posts); API and MCP connector on Pro/Max (outlier search, channel/video data, transcripts, comments). — [OutlierKit](https://outlierkit.com/blog/best-youtube-outlier-finder-tools)
- Social Blade: free tier ad-supported; paid tiers about $3-$83/mo (annual) varying by source; CSV export, track 15-500 profiles per platform; Business API is prepaid credits. — [OutlierKit, Aug 2026](https://outlierkit.com/resources/social-blade-pricing/)
- Playboard: no official pricing found; historical data export claimed by a third-party blog only. — [Overseer](https://www.overseeros.com/blog/best-playboard-alternatives)
- TubeBuddy: Pro roughly $3-5/mo, Legend roughly $23-49/mo; free tier status conflicting. — [1of10 TubeBuddy review](https://1of10.com/blog/tubebuddy-pricing-review/), [Capterra](https://www.capterra.com/p/172520/TubeBuddy/pricing/)

### Inferences
- A local-first tool beats subscription tools on cost, data ownership and export, but cannot match their pre-indexed "millions of channels" cross-niche search.

### Gaps
- Exact current prices (all sources vendor-authored or conflicting); data retention and video-per-channel limits are undisclosed for every tool.

## 3. Gaps vs a local-first single-user tool (import channels by URL/handle, browse/search, outliers, topic grouping, title-pattern analysis)

### Takeaway
Commercial tools focus on discovery across a hosted global index plus AI generation. A local, user-curated corpus with transparent outlier math, topic clustering and title-pattern analysis is not evidenced as offered by any of them.

### Cited Findings
- 1of10 and vidIQ compute scores in hosted indexes; competitor channels are tracked from within the product, and free tiers cap tracked channels (1 on 1of10 official free; 3 per the vendor review). — [1of10 pricing](https://1of10.com/pricing), [1of10 review](https://1of10.com/blog/1of10-review/)
- 1of10's title tool is generative ("drafts titles based on patterns from the outlier database") rather than exposing the patterns; per the review, specific pattern features are not listed. — [1of10 review](https://1of10.com/blog/1of10-review/)
- OutlierKit's roundup found no title-pattern analysis in 1of10 or vidIQ, and no keyword/script analysis in ViewStats. — [OutlierKit](https://outlierkit.com/blog/best-youtube-outlier-finder-tools)
- API/MCP access is gated to higher tiers (1of10 Pro+, OutlierKit Pro/Max). — [1of10 pricing](https://1of10.com/pricing), [OutlierKit](https://outlierkit.com/blog/best-youtube-outlier-finder-tools)

### Inferences
- Likely differentiators: (1) bulk import by handle/URL with full-history fetch (via YouTube Data API or yt-dlp) into a local DB; (2) documented, tunable baseline (median of last N, per-format Shorts vs long); (3) deterministic title-pattern mining (n-grams, templates, length, numbers, capitalization) tied to outlier status; (4) topic clustering via embeddings of titles/descriptions/transcripts; (5) full export and offline ownership; (6) no credits or paywalled filters.
- Weaknesses of local approach: no global discovery index, view history only from fetch time (no daily velocity unless snapshots are stored), API quota limits.

### Gaps
- No evidence found about how any vendor handles pre-publish title scoring beyond AI marketing, or about UI of tracked-channel imports (by URL/handle); help pages did not specify.
