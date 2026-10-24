# Outlier / outperforming YouTube video detection: tool and literature survey (as of 2026-10-24)

Evidence quality note: no tool (1of10, ViewStats, Outlier, vidIQ) publishes a full formula. Most detail comes from vendor help pages (primary but vague) or from competitor/third-party pages (OutlierKit sells a rival product and is biased). "Documented" below means stated on a cited page; "Inferences" are mine.

## 1. How do 1of10, Outlier, vidIQ, ViewStats and creator-education sources define outliers?

### Takeaway
All tools define outlier score as a ratio: video views divided by a channel-specific baseline of that channel's other uploads. They differ in baseline statistic (mean vs median), window (about 9-10 videos up to 25-30), and whether age or format is matched. Most tools never disclose these details. Thresholds cluster around 2x (noteworthy), 3-5x (strong), 10x (exceptional).

### Cited Findings
- vidIQ (official help): an outlier is a video that has "surpassed a channel's usual performance". The score "measures a video's performance relative to the average performance of other videos on the same channel" and compares view count "to the channel's average views within a similar timeframe". Window and mean-vs-median are not stated. — [vidIQ help](https://support.vidiq.com/en/articles/9660010-uncover-top-performers-outliers)
- vidIQ colour brackets are multiples of the baseline: under 2x black, 2-5x blue, 5-10x purple, above 10x red. The filter slider runs 0 to 100+, and the relation between that scale and the colours is unexplained. — [vidIQ help](https://support.vidiq.com/en/articles/9660010-uncover-top-performers-outliers)
- vidIQ's Outliers tool also filters by views, subscribers, views per hour (0-1K+), video length (0-60+ min) and publish date. Its worked example: 10,000 views on a channel averaging 1,000 is 10x, while 10M views on a channel averaging 10M is 1x. — [vidIQ help](https://support.vidiq.com/en/articles/9660010-uncover-top-performers-outliers)
- 1of10 (vendor review page): the score is "a simple ratio: a video's views divided by its channel's typical views". The page does not say whether the baseline is mean or median, what window it uses, or whether it adjusts for age or Shorts. It shows badges like 7.1x and mentions views-per-hour tracking. — [1of10 review](https://1of10.com/blog/1of10-review/)
- 1of10 feature page example: 500k views on a channel averaging 50k is a 10x outlier. This is the average-based phrasing; I did not fetch that page directly (search snippet only). — [1of10 homepage outliers](https://1of10.com/features/homepage-outliers)
- ViewStats: no official methodology found. A competitor (OutlierKit) says ViewStats compares a video against the creator's previous 9 uploads, with 1.0x as the channel's recent average, and does not say whether the baseline is mean or median or time-aligned. — [OutlierKit on Viewstats](https://outlierkit.com/resources/viewstats-chrome-extension/); another OutlierKit page says ViewStats uses the average of the prior ten videos at a comparable point in time — [OutlierKit/Overseer benchmark page](https://www.overseeros.com/blog/youtube-outlier-benchmark-report). These two statements conflict (9 vs 10 prior videos; time-aligned or not) and neither is confirmed by ViewStats.
- "Outlier" (the tool): I found no official methodology. Third-party "outlier finder" pages describe median-based baselines (for example, median of the last 25 videos) but none is confirmed to be Outlier's. — [search results, unverified](https://outlierkit.com/resources/outlier-finder-tool/)
- Subscribr (official help): outlier score = video views / average views of up to 10 surrounding videos from the same channel (published before and after the video), rounded to one decimal. Separately a "Views/Sub ratio" is shown, with no formula given. — [Subscribr help](https://help.subscribr.ai/article/48-what-are-velocity-and-outlier-scores)
- Vamos (official help): score is the video compared with the channel's own median, shown only if the creator has at least 10 posts. In its weekly brief a post must exceed 2x the creator's median to count as an outlier finding. The window is not stated. — [Vamos help](https://intercom.help/getvamos/en/articles/16934858-the-outlier-score)
- OutlierKit (competitor, vendor guidance): recommends the median of recent comparable uploads as baseline, mean as secondary check, excluding the focal video from its own baseline, and separate baselines for Shorts, long-form, livestreams, etc. Confidence by baseline size: under 5 videos very low; 5-9 low; 10-19 moderate; 20-30 high. — [OutlierKit methodology](https://www.overseeros.com/blog/youtube-outlier-benchmark-report)
- OutlierKit threshold ladder: under 1x below baseline; 1-1.49x normal; 1.5-1.99x notable; 2-2.99x emerging; 3-4.99x strong; 5-9.99x breakout; 10-19.99x exceptional; 20x+ "audit the baseline first". It calls these operational benchmarks, not guarantees. — [same page](https://www.overseeros.com/blog/youtube-outlier-benchmark-report)
- A separate OutlierKit page says 2x is noteworthy but may be noise, 3x+ significant, 5x+ possible viral hit, and 20x+ often reflects external factors (celebrity mention, algorithm boost). — [OutlierKit outlier scores](https://outlierkit.com/resources/outlier-scores/)
- OutlierKit rejects views/subscribers as an outlier score because subscriber counts are rounded to 3 significant figures and say nothing about activity; it suggests using subscribers only to pick comparable channels. Its example: a 500k-sub channel may normally get 30k views while a 40k-sub channel regularly gets 80k. Another vendor reportedly uses views-per-subscriber divided by the median of that ratio (single search snippet, vendor not identified). — [OutlierKit methodology](https://www.overseeros.com/blog/youtube-outlier-benchmark-report); [search result summary](https://touhfa.art/blog/seo/youtube-outlier-finder-guide/)
- The same source states that different baselines (current-view ratio, recent average/median, age-matched average, first-48-hour score, views-per-day ratio) answer different questions, so scores from different tools should not be compared. It also notes public data gives only cumulative views, not historical snapshots, so exact age matching usually requires estimation. — [OutlierKit methodology](https://www.overseeros.com/blog/youtube-outlier-benchmark-report)
- A tiny baseline inflates scores: 5,000 views against a two-video baseline of 250 gives 20x on weak evidence. — [search summary](https://www.overseeros.com/blog/youtube-outlier-benchmark-report); worked example on the methodology page: 90,000 / 3,000 median = 30x from a 6-video baseline, low confidence.

### Inferences
- The shared "industry" definition is: outlier_score = views / baseline(channel's other videos). The only real design choices are baseline statistic, window, age handling and format split.
- Tools that publish a window use roughly 9-10 videos (ViewStats, Subscribr) up to 25-30 (OutlierKit guidance); a typical default for a local tool would be 10-30 videos.
- Threshold convention: 2x flag, 3-5x strong, 10x exceptional. vidIQ's brackets are the only one confirmed by an official page.

### Gaps
- No primary documentation for ViewStats, Outlier or 1of10 baseline statistic/window; the ViewStats 9-vs-10 conflict is unresolved.
- Whether any tool age-adjusts (views at equal age) is undocumented for the three named tools; vidIQ says only "similar timeframe".
- No evidence found for how any tool treats Shorts vs long-form beyond 1of10's separate paid Shorts Outliers feature.

## 2. Statistical approaches for heavy-tailed view counts, and caveats

### Takeaway
The academic literature supports modelling views on a log scale and normalising by video age, since log views at early and later ages are strongly correlated. Practitioner guidance favours the median over the mean as baseline. Robust-statistics specifics (MAD, percentile ranks) are standard methods but I found no tool that documents using them, other than OutlierKit's unsourced mention of standard deviations.

### Cited Findings
- Szabo and Huberman: early views forecast long-term popularity; YouTube views needed about 10 days of tracking to reach accuracy that Digg reached in 2 hours, because "Youtube videos are still found long after" submission. Predictions are less accurate for evergreen content. — [arXiv 0811.0405](https://arxiv.org/abs/0811.0405)
- Secondary descriptions say the model is log-linear (log of later popularity is approximately a constant plus log of early popularity), with log-views at day 7 and day 30 correlating about 0.92 on YouTube, and Cha et al. (2007) r=0.84 between day 2 and day 90. I did not read the full text; the abstract I fetched does not mention log transform. — [secondary summary, unverified](https://ar5iv.labs.arxiv.org/html/0811.0405)
- Cha, Kwak, Rodriguez, Ahn, Moon (IMC 2007) study YouTube popularity distribution and its relationship to video age; the keywords include power-law and long tail. I did not retrieve their fitted results. — [paper](https://www.cl.cam.ac.uk/~jac22/camhor/mia_imc07_sumitted.pdf)
- A UNSW thesis (via search listing) reports "rich-get-richer" growth where prior views are the main predictor, except for very young videos. Not verified beyond snippet. — [UNSW](https://doi.org/10.26190/unsworks/15892)
- Practitioner caveats: one viral hit inflates a mean baseline, so median is safer; baselines should match format and age; extreme scores (20x+) often reflect non-replicable external factors; context such as upload frequency and channel age matters. — [OutlierKit](https://outlierkit.com/resources/outlier-scores/), [OutlierKit methodology](https://www.overseeros.com/blog/youtube-outlier-benchmark-report)
- Small-sample and new-channel caveat: Vamos requires 10 posts before showing a score — [Vamos](https://intercom.help/getvamos/en/articles/16934858-the-outlier-score).

### Inferences
- (Standard statistics, not from these sources) Views are roughly log-normal/power-law, so a log-scale robust z-score, (ln v - median(ln v)) / (1.4826 * MAD(ln v)), is a natural, tail-resistant analogue to the ratio. A ratio to the median is equivalent to a log-difference from the median, so the two rankings agree if the baseline is the same.
- Age normalisation: a cumulative-view ratio penalises recent videos (still accumulating) and favours old ones. Options, from simplest: exclude videos younger than N days; compare views per day; or compare to the baseline at equal age (needs historical snapshots a local tool may lack). Szabo-Huberman supports using fixed-age views when available.
- Duration (a proxy for Shorts vs long-form) should split baselines; otherwise Shorts and long-form distort each other's baseline, as the OutlierKit guidance implies.
- Leave-one-out baselines (exclude the focal video) avoid the video diluting its own benchmark in short windows.

### Gaps
- No documented use of MAD or percentile ranks in any YouTube outlier tool.
- No peer-reviewed paper specifically about "outlier video" detection using channel baselines; only popularity-dynamics papers.
- Shorts vs long-form view-distribution differences: no citable source found.
- No citable viral-fluke detection method found.

## 3. Which approach needs the fewest data fields, and which is most robust?

### Takeaway
Minimum: per-video view count plus the channel's other videos' view counts (ratio to the channel median). This matches the common tool definition and needs no publish date or subscriber count. Most robust per practitioner guidance: median of recent comparable (same format, similar age) uploads, with a minimum sample size and the focal video excluded.

### Cited Findings
- Simplest documented form: views / channel typical views (1of10) — [1of10](https://1of10.com/blog/1of10-review/).
- Subscriber-ratio methods are criticised as inaccurate because subscriber counts are coarse and not activity-linked — [OutlierKit methodology](https://www.overseeros.com/blog/youtube-outlier-benchmark-report). Counterpoint: Subscribr displays Views/Sub as a separate reach metric — [Subscribr](https://help.subscribr.ai/article/48-what-are-velocity-and-outlier-scores).
- Age-matching needs historical snapshots that public pages do not provide, so it is usually estimated — [OutlierKit methodology](https://www.overseeros.com/blog/youtube-outlier-benchmark-report).

### Inferences
- Tiers by data need: (1) views only: video / channel-median views, minimum about 10 videos; (2) + publish date: drop or down-weight videos younger than a set age, or use views/day, and use a time-window baseline; (3) + duration: split Shorts vs long-form baselines; (4) + subscribers: use only for peer-channel filtering or as a secondary reach metric.
- The local tool's fields (views, date, duration, channel history) are enough for tier 3. Recommended core: median of the channel's last ~10-30 same-format videos older than a maturity threshold, leave-one-out, score on the ratio or its log, flag at 2x/5x/10x, and show baseline size as a confidence indicator.
- These are my recommendations; no source documents this exact combination.

### Gaps
- No empirical comparison of baseline methods' accuracy found in the literature.
- Optimal maturity threshold and window size are untested; the numbers above are vendor conventions, not validated.
