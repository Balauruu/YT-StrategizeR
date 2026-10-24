# Research: local approaches to grouping titles into topics

Issue: Balauruu/YT-StrategizeR#3 (child of map #1). Fetched 2026-10-24.
Question: viable local, low-cost ways to cluster/label ~100k short video titles into topics. Compare keyword/TF-IDF, local sentence embeddings + clustering, and LLM labeling (cost, quality, offline-ability, failure modes on short titles).

## Summary

- Best fit: local sentence embeddings (small model, CPU-OK) -> UMAP -> HDBSCAN (or k-means for no-outlier coverage), then c-TF-IDF keywords per cluster. BERTopic packages exactly this pipeline.
- LLMs are best used only to *name* clusters (hundreds of calls, pennies hosted or free with a local model), not to classify all 100k titles. Even classifying every title is about a dollar on the cheapest hosted model.
- Plain TF-IDF/keyword grouping is cheapest and fully explainable but groups by shared words, not meaning. Use it for labels and as a baseline, not as the grouping engine.
- Main failure modes: large HDBSCAN noise bucket (topic -1), UMAP splitting/distorting clusters, English-only models on non-English titles.

## 1. Keyword / TF-IDF

- `TfidfVectorizer` has `ngram_range` (default (1,1)), `min_df`, `max_df`, `stop_words`, `sublinear_tf`. Docs warn the built-in `'english'` stop list has "several known issues" and suggest `max_df` in (0.7, 1.0) to auto-filter corpus-specific stop words. [sklearn TfidfVectorizer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html)
- Sparse TF-IDF vectors are high-dimensional; sklearn's KMeans docs say inertia degrades in high dimensions and recommend PCA first (docs example uses `PCA(n_components=20)`). [sklearn clustering](https://scikit-learn.org/stable/modules/clustering.html) (PCA does not accept sparse input; TruncatedSVD is the sparse analogue, not covered on that page.)
- Cost: CPU only, seconds to minutes at 100k titles; no model download; fully offline and explainable.
- Short-title failure mode (inference from method, not stated in sources): titles share few terms, so vectors are near-orthogonal; synonyms ("car"/"vehicle") never match.

## 2. Local sentence embeddings + clustering

Models (all local, CPU-capable):
- `all-MiniLM-L6-v2`: 384-dim, English, truncates input beyond 256 word pieces (irrelevant for titles), trained on 1B+ sentence pairs. [HF model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). sbert docs call it "5 times faster" than all-mpnet-base-v2 with good quality; all-mpnet-base-v2 "provides the best quality" of the all-* models. [sbert pretrained models](https://www.sbert.net/docs/sentence_transformer/pretrained_models.html)
- `BAAI/bge-small-en-v1.5`: 384-dim, 33.4M params, 512 max tokens, MIT licence, MTEB clustering avg 43.82. [HF model card](https://huggingface.co/BAAI/bge-small-en-v1.5)
- Multilingual (if titles aren't English): `paraphrase-multilingual-MiniLM-L12-v2` / `-mpnet-base-v2` (50+ languages). LaBSE is for translation-pair mining and is weaker for general similarity. [sbert pretrained models](https://www.sbert.net/docs/sentence_transformer/pretrained_models.html)
- I found no first-party throughput numbers for these models; benchmark on the user's hardware. 100k titles x ~15 tokens is small.

Clustering:
- sentence-transformers documents three approaches: k-means (needs cluster count, roughly equal sizes), agglomerative (threshold-based but "only applicable for maybe a few thousand sentences"), and fast clustering (cosine threshold + min community size, "50k sentences in less than 5 seconds"). [sbert clustering](https://sbert.net/examples/applications/clustering/README.html)
- sklearn: KMeans/MiniBatchKMeans scale to very large n_samples with medium n_clusters; HDBSCAN handles large n_samples, uneven sizes, and outlier removal, multithreaded; plain agglomerative is expensive without connectivity constraints. [sklearn clustering](https://scikit-learn.org/stable/modules/clustering.html)
- HDBSCAN scaling: benchmarks to 200k points (10-dim data only); extrapolation puts ~100,000 points at an interactive (<30 s) run. No guidance for high-dimensional input, so reduce dimension first. HDBSCAN has worse memory scaling than OPTICS. [hdbscan performance](https://hdbscan.readthedocs.io/en/latest/performance_and_scalability.html), [sklearn clustering](https://scikit-learn.org/stable/modules/clustering.html)
- UMAP before HDBSCAN: use more than 2 dims (e.g. 10), `n_neighbors` larger than the default 15 (example 30), `min_dist=0`; keep the clustering embedding separate from the visualisation embedding. [umap-learn clustering](https://umap-learn.readthedocs.io/en/latest/clustering.html)
- BERTopic wraps embeddings -> UMAP -> HDBSCAN -> c-TF-IDF. Its FAQ: pre-compute embeddings, `low_memory=True` can avoid UMAP memory blow-ups, limit vocabulary via `min_df`, keep `calculate_probabilities` off for large corpora, and `reduce_outliers` can reassign topic -1 documents after training; swapping HDBSCAN for k-means yields no outliers. [BERTopic FAQ](https://maartengr.github.io/BERTopic/faq.html)
- Cost: free; one-time embedding pass plus minutes of clustering on CPU. Embeddings (100k x 384 floats, about 154 MB) can be cached in the local DB so re-clustering is cheap and newly synced Videos only need incremental embedding (inference).

Known failure modes (documented):
- HDBSCAN labels many points noise; scores on only clustered points look good while coverage is low (umap-learn example: ~17% coverage on PCA data vs >99% with UMAP). Report coverage. [umap-learn](https://umap-learn.readthedocs.io/en/latest/clustering.html)
- UMAP does not fully preserve density and can split one true cluster into several ("false tears"). [umap-learn](https://umap-learn.readthedocs.io/en/latest/clustering.html)
- Lowering `min_samples` reduces noise but may push outliers into wrong topics; many -1 docs may mean few real topics. [BERTopic FAQ](https://maartengr.github.io/BERTopic/faq.html)
- English-only models on non-English titles (model card tags English). [HF](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- Inference (not in sources): clickbait framing/format words ("I tried...", "Top 10...") can dominate embedding similarity over subject matter; check cluster purity manually.

## 3. LLM-based labeling

- BERTopic's LLM representation sends each topic's top c-TF-IDF keywords plus a few representative documents (default 4, configurable via `nr_docs`, truncatable via `doc_length`) to a generator and returns a label. Backends: OpenAI, Cohere, LiteLLM, Ollama (OpenAI client at `localhost:11434/v1`), local Transformers pipelines, llama.cpp GGUF. So labeling can be fully offline with a local model. [BERTopic LLM](https://maartengr.github.io/BERTopic/getting_started/representation/llm.html)
- Hosted pricing (Anthropic docs, per MTok in/out): Claude Haiku 5.5 $0.10/$0.50 (prompts up to 100k tokens), Haiku 4.5 $1/$5, Sonnet 5.5 $2/$10; Batch API gives 50% off both. [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Cost estimates (my arithmetic; assumes ~15-token titles, ~60 input tokens/title with instructions, ~10 output):
  - Name ~300 clusters (~600 input tokens each, ~20 output): ~0.2M in / 6k out -> well under $0.05 even on Sonnet 5.5; effectively free on Haiku 5.5.
  - Classify all 100k titles individually: ~6M in / 1M out -> about $1.10 on Haiku 5.5 ($0.55 batch); about $22 on Sonnet 5.5 ($12 + $10); about $11 on Haiku 4.5 ($6 + $5).
- OpenAI pricing page returned HTTP 403 to my fetcher; not verified here.
- Failure modes (inference, not source-stated): per-title LLM labels are non-deterministic and drift in granularity ("Gaming" vs "Minecraft speedruns") across batches, so cluster-then-name (or a fixed taxonomy) is more stable; not offline unless a local model is used.

## Comparison

| Approach | Offline | Cost at 100k | Quality on short titles | Notes |
|---|---|---|---|---|
| TF-IDF + k-means/keywords | yes | ~0 | weak semantic grouping | Great for labels and explainability |
| MiniLM/bge-small embeddings + UMAP + HDBSCAN (BERTopic) | yes | ~0 (CPU, minutes) | good; noisy -1 bucket | Recommended grouping engine |
| Same, k-means instead of HDBSCAN | yes | ~0 | full coverage, forced similar-size clusters | Needs cluster count |
| LLM naming of clusters | optional (Ollama/llama.cpp) | ~$0-0.05 hosted | good labels | Recommended labeling step |
| LLM classify every title | no (unless local, slow) | ~$0.5-22 hosted | flexible but inconsistent | Optional refinement only |

## Open items for the spec
- Are titles English-only? Determines model choice.
- Is a noise/"unclassified" bucket acceptable, or must every Video get a topic (k-means / `reduce_outliers`)?
- Hosted LLM allowed, or strictly offline (Ollama)? Labeling is cheap either way.
