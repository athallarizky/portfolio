# RAG: Boarding House Search Engine

> Personal · 2026

An end-to-end AI + RAG system for finding kos (Indonesian boarding houses): classifies POI vs area queries, scrapes listings by postal code, and recommends via semantic search plus an LLM.

**Tech:** go, javascript, rag, chroma
**Source:** —

## Overview

I recently built an end-to-end AI + RAG system for finding kos — Indonesian boarding houses. The flow has four steps:

1. **Classify the query: Point of Interest or Specific Area.** Handled with Fuse.js, a fuzzy-search library. The app needs a valid query before scraping anything, so it has to tell the two apart: "Kos near Mall One Belpark" is a POI — scrape around that spot directly; "Kos in Cilandak" is an area — map it to postal codes. Queries that fit neither get skipped up front.

2. **Scrape the listings for that area** (Google Maps). The trick is simple: all you really need is the postal code. An area like Cilandak has several, and for each one you generate the spelling variants — "Kos di [postal code]", "Kosan di [postal code]", "Kost di [postal code]". More queries, more data — and more compute. POIs work the same way: a third-party API translates the place name into coordinates, and the scraper queries around them.

3. **Normalize, then into a vector DB (Chroma).** The scraped data is cleaned and deduplicated, split into chunks, embedded into vectors by an embedding model, and stored. That's the RAG part: retrieval by meaning, so you can search in natural human language instead of exact keywords.

4. **Bring in an LLM for recommendations.** RAG results alone would work, but the responses feel static — the LLM makes them dynamic. The app supports both "AI" and "Normal" chat modes, multi-provider and multi-model via API key.

## What I learned

- Embedding models come in flavors. Some are trained on English only — more accurate when you also search in English — while others are multilingual.
- The better the model, the better the results, and the heavier the compute. This project tried two: bge-m3 and e5-small-embedding.
- The scraper is written in Go, whose goroutines let it run several tasks at once — the three query variants ("kos", "kosan", "kost") for one postal code execute in parallel instead of sequentially.

---

> **Draft-only run:** no repo attached — `links` and `architecture` omitted.
> `year` inferred as 2026 from the draft ("kemarin"). Fix the JSON if that's off.
