# YouTube title/topic analysis: existing tools, libraries, prior art (as of 2026-10-24)

Scope note: about 14 tool calls. Search snippets were partly summarized by the tool; items I opened directly are marked (fetched). Coverage is thin on Kaggle notebooks and academic topic-clustering of titles.

## 1. Projects/papers analyzing YouTube titles or topics at scale: methods, results, failure modes

### Takeaway
Topic modeling is mostly done with BERTopic on transcripts or LLM-enriched metadata, not on bare titles. I found no study that models titles alone and reports quality. Clickbait datasets exist and are multimodal. Trending-dataset notebooks are mostly descriptive.

### Cited Findings
- BERTopic default pipeline: sentence-transformers embeddings, UMAP, HDBSCAN, c-TF-IDF. Topic -1 holds outliers, and `reduce_outliers` can reassign them after training. Each document gets a single topic — [BERTopic repo](https://github.com/maartengr/bertopic), [FAQ](https://maartengr.github.io/BERTopic/faq.html). Docs pages are older, so check current defaults.
- Grootendorst's Kurzgesagt tutorial applies BERTopic to Whisper transcripts split into sentences, not to titles. Titles are kept only to map back to videos — [tutorial](https://www.maartengrootendorst.com/blog/whisper/). Date not verified.
- A 2025 chapter on a Swedish Salafism YouTube channel (1,680 videos) had GPT-4o mini guess each video's content from title + description, then ran BERTopic on the guesses. The authors present it as a quick first survey step — [UT DSpace](https://dspace.ut.ee/items/b286907b-a431-4104-b94c-a0898fcd8e8d/full). Not fetched (connection error); details come from a search summary.
- A 2024 Springer study applied BERTopic to video text but inspected titles manually for its analysis — [Springer](https://link.springer.com/article/10.1007/s13278-024-01343-5). Search summary only.
- Kaggle "Trending YouTube Video Statistics" (datasnaek): US file about 40,949 rows. Notebooks bucket title length (Short 0-30, Medium 31-60, Long 60+) and compare views — [TDS](https://towardsdatascience.com/youtube-trending-video-analysis-with-pandas-and-seaborn-8eec48a5e2d9/), [Datawars](https://datawars.io/data-science-project/8aa5d552-pandas-data-wrangling-practices-using-youtube-trending-videos-dataset), [GitHub example](https://github.com/ashutoshkrris/YouTube-Trending-Videos-Analysis). I did not open the notebooks. Caveat: the sample contains only videos that trended, so it has selection bias.
- A 2023 Computer Journal paper does EDA on 40,950 trending videos over 205 days — [EBSCO](https://www.ebsco.com/articles/biography/0edba6f9-7465-5129-80b8-4eb319d3d7e5/youtube-trending-videos-boosting-machine-learning-results-using-exploratory-data-analysis). Abstract-level only.
- Clickbait datasets:
  - YTClickbait21K (arXiv 2606.14780, June 2026): 21,238 videos, 40 channels, 29 countries. Three annotators, majority vote, kappa 0.65. Thumbnail + metadata (fetched; page reported no baselines) — [arXiv](https://arxiv.org/abs/2606.14780).
  - BanClickThumb (arXiv 2607.17182, 2026) is a Bengali multimodal benchmark — [arXiv](https://arxiv.org/pdf/2607.17182).
  - CHECKER (ECML-PKDD 2021) uses title + thumbnail with weak supervision; code at github.com/XPandora/CHECKER — [paper](https://pike.psu.edu/publications/ecmlpkdd21.pdf).
  - BaitRadar (arXiv 2505.17448) is a multi-model detector tested on 1,400 videos — [arXiv](https://arxiv.org/html/2505.17448v1).
  - BaitBuster-Bangla (Data in Brief, 2024) has 253,070 data points — [PwC](https://ml.paperswithcode.com/dataset/baitbuster-bangla).
  - An ensemble-learning paper reports 92.89% on BollyBAIT and 95.38% on MVD — [arXiv 2112.08611](https://arxiv.org/pdf/2112.08611).
- Failure mode reported: clickbait labeling is subjective (kappa only 0.65 on the largest dataset) — [YTClickbait21K](https://arxiv.org/abs/2606.14780). Most datasets are small or non-English.

### Inferences
- Titles are short. The only BERTopic-on-metadata example I found enriched them with an LLM first. For a local tool, embedding titles plus description, or LLM-labeling then clustering, looks more promising than raw-title BERTopic. This is untested.
- Expect many BERTopic outliers (-1) on short, varied titles, so plan for `reduce_outliers`.

### Gaps
- No published evaluation of BERTopic, TF-IDF, or LLM labeling on titles only, and no failure-mode report on that task.
- Did not open specific Kaggle notebooks, so no specific Kaggle results are reported.

## 2. Local/self-hosted tool combining channel import + title patterns + topic clustering

### Takeaway
The closest match is pandich93/youtube-niche-finder (MIT, self-hosted). It does outlier detection and title-pattern comparison but shows no explicit clustering. No tool found covers all three requirements.

### Cited Findings
- pandich93/youtube-niche-finder (fetched): MIT licence, 18 stars, 3 forks, 280 commits, last-commit date not shown. Built as an alternative to NexLev and vidIQ. Components: MCP server, HTTP API, worker, YouTube Data API v3, PostgreSQL, no-build dashboard. Features: outlier detection against each channel's median, a "What outliers share" view (number or "?" in title), title checking against niche patterns, niche scoring 0-100, "niche map" and semantic search. Clustering method not documented — [repo](https://github.com/pandich93/youtube-niche-finder); found via [GitHub topic page](https://github.com/topics/youtube-analytics).
- Other repos on that topic page (licences not shown): youtube-seo-skills (16 stars), youtube-marketing-skills (68 stars), video-analyser (25 stars), Advanced-Youtube-Seo-Generator-2.0 (11 stars). These are SEO/generation tools, not analytics — [topic page](https://github.com/topics/youtube-analytics).
- YTStatsAnalyzerGo is open-source Go, YouTube Data API v3. It ranks top videos by views, likes, and comments, with no evident title analysis — [DEV post](https://dev.to/lousycake/unleashing-ytstatsanalyzergo-a-go-powered-dive-into-youtube-channel-insights-2526). Search summary only.
- OutlierKit is a hosted commercial service that shows outlier videos and title patterns — [OutlierKit](https://outlierkit.com/channel/apnaailab). Not self-hosted.
- A topic-page entry (dav19e/VidIQ-Boosted-Insight-Suite, 63 stars) looks like it may distribute cracked or paid software. Avoid it — [topic page](https://github.com/topics/youtube-analytics).

### Inferences
- A custom build is justified. The niche-finder repo is a possible reference for its outlier and title-trait logic, but it is young and low-star, so verify its maintenance before depending on it.

### Gaps
- Exhaustive GitHub search was not possible (no code search). Maintenance status (last commit, issue activity) of niche-finder is unverified.

## 3. Reusable libraries for title features and clickbait/sentiment

### Takeaway
Handcrafted features (length, numerals, "?", caps, brackets) are trivial to compute directly. Off-the-shelf pieces are VADER, textstat, and Hugging Face clickbait classifiers, mostly news-headline-trained.

### Cited Findings
- vaderSentiment 3.3.2, MIT, last release May 2020 (Snyk rates maintenance inactive) — [Snyk](https://snyk.io/advisor/python/vaderSentiment), [PyPI](https://pypi.org/project/vaderSentiment/). Snapshot may be outdated.
- textstat 0.7.4, MIT, released July 2024, maintenance rated healthy — [Snyk](https://snyk.io/advisor/python/textstat). Snapshot may be outdated.
- Hugging Face clickbait classifiers: ENTUM-AI DistilBERT (reports 98.6% accuracy/F1 on marksverdhei/clickbait_title_classification) and RoBERTa (about 48K deduplicated English samples, 128-token max) — [DistilBERT card](https://huggingface.co/ENTUM-AI/distilbert-clickbait-classifier/blob/main/README.md), [RoBERTa card](https://huggingface.co/ENTUM-AI/roberta-clickbait-classifier/blob/main/README.md). Another (Aurora) is explicitly a demo model — [card](https://huggingface.co/Islamamro/clickbait-aurora-islamamro).
- Hybrid approach (arXiv 2602.18171, Feb 2026, fetched): XGBoost over embeddings plus 15 explicit features (second-person pronouns, superlatives, numerals, attention punctuation) reaches F1 91%, beating TF-IDF, Word2Vec, GloVe, prompted-LLM, and feature-only baselines. Says code and models are released but no repo link was visible — [arXiv](https://www.arxiv.org/abs/2602.18171).
- Chakraborty et al. (2016/17) report 0.98 accuracy on news headlines — [arXiv 1612.01340](https://arxiv.org/abs/1612.01340v1).
- A Medium post using a pre-trained clickbait classifier on YouTube found little correlation between clickbait score and views — [Medium](https://medium.com/data-science/youtube-views-predictor-9ec573090acb). Informal source.

### Inferences
- High reported accuracy is on news headlines and may transfer poorly to YouTube titles. Treat classifier scores as one weak feature and validate on a hand-labeled sample.
- VADER is unmaintained but stable and works on short text.

### Gaps
- Did not verify current PyPI versions, licences of the HF models, or HF model downloads. Did not find a dedicated YouTube-title feature library.

## 4. Evidence on title features vs performance

### Takeaway
No rigorous causal evidence found. Available evidence is correlational and mostly vendor-published. Effects of clickbait-style wording look near zero. Length 30-50 characters and niche-dependent effects are reported by one vendor without effect sizes.

### Cited Findings
- OverseerOS (published 2026-09-12, vendor with a conflict of interest; fetched): 2,309 videos, 62 channels, views/day normalized by channel median. Word-list "clickbait-style" titles (10.3%) had median 1.00x, same as others. In 169 matched same-channel pairs the median ratio was 1.06x, 52.1% wins. A 9,198-video check showed 0.998x overall and 0.93x matched. Caveats stated: thumbnails and impressions uncontrolled, titles may have been edited, association only — [OverseerOS](https://www.overseeros.com/blog/do-clickbait-youtube-titles-get-more-views).
- AIR Media-Tech (updated 2026-06-12, vendor; fetched): 18,080 channels, 11 niches, 4 size tiers, correlational. Metric: median engagement rate ((likes+comments)/views), secondary p75 views. Findings: 30-50 characters the best overall, 90+ lower views. Numbers help in Tech, Business, Fitness, and Food. "?" helps in Education, Business, and Science & Tech. ALL CAPS is positive in Gaming/Entertainment, negative in Education. Brackets show a modest positive. Curiosity language is the most consistent positive. No effect sizes or significance values were given. Engagement rate is not views, and the authors admit confounding — [AIR](https://air.io/en/audience-growth/how-to-write-a-youtube-title-that-gets-clicked-research-across-11-niches).
- Academic: a sentiment study of 16,215 video covers found positive-sentiment titles got more views, and punctuation, caps, and emoticons contributed to more clicks — [Lingnan scholars](https://scholars.ln.edu.hk/en/publications/clicks-for-money-predicting-video-views-through-a-sentiment-analy/). Search summary only; publication year and model not verified.
- A ZHAW conference paper (thumbnails/captions, not titles) reports clickbait positively correlated with channel success — [ZHAW](https://digitalcollection.zhaw.ch/handle/11475/26320?mode=full). Summary only.
- Trending-list length stats: a decline at 100 characters (NYC Data Science Academy blog) and most trending titles 41-60 characters (TunePocket, commercial blog; 50K titles) — [NYCDSA](https://nycdatascience.com/blog/?p=50995), [TunePocket](https://www.tunepocket.com/?p=79062). Selection bias: trending only.
- Not credible: Tyler Vigen "papers" on YouTube titles are satirical, AI-generated spurious correlations; do not cite.

### Inferences
- Channel-relative normalization (video views vs the channel's own median) with matched same-channel comparisons is the sound design pattern for a local tool. Raw cross-channel correlations mostly measure channel size.
- Any in-tool "title score" should be presented as descriptive within-channel/niche patterns, not as causal advice.

### Gaps
- No peer-reviewed, causal (A/B test or randomized) evidence on title features located. YouTube "Test & Compare" evidence not searched.
- Primary dataset or code for the vendor studies was not found, so they cannot be reproduced.
